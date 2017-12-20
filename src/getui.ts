import * as _ from 'lodash';
import * as rp from 'request-promise';
import * as createError from 'create-error';

import { sha256, getRequestId, removeUndefined } from './util';
import { Target, SingleMessage, AppMessage, ListMessage, TargetList, BatchTask } from './message';
import { setTimeout } from 'timers';

const GetuiError = createError('GetuiError', {
  code: 'GETUI_ERROR',
});

const GETUI_BASE_URL: string = 'https://restapi.getui.com/v1';

export class GetuiOption {
  appId: string;
  appSecret: string;
  appKey: string;
  masterSecret: string;
}

export default class Getui {
  public options: GetuiOption;
  private _rp: any;
  private _authToken: string;

  constructor(options: GetuiOption) {
    this.options = options;

    this._rp = rp.defaults({
      baseUrl: `${GETUI_BASE_URL}/${this.options.appId}`,
      method: 'POST',
      headers: {
        'User-Agent': 'node-rest',
      },
      json: true,
    });
  }

  private async request(params: any): Promise<any> {
    if (params.body) {
      params.body = removeUndefined(params.body);
    }
    if (this._authToken) {
      params.headers = {
        'User-Agent': 'node-rest',
        authtoken: this._authToken,
      }
    }
    console.log(JSON.stringify(params.body, null, 2))
    const ret = await this._rp(params);
    if (ret.result !== 'ok') throw new GetuiError(ret.result, { detail: ret });
    return ret;
  }

  public async authSign(): Promise<void> {
    const timestamp = _.now();
    const sign = sha256(`${this.options.appKey}${timestamp}${this.options.masterSecret}`);
    const { auth_token } = await this.request({
      url: `/auth_sign`,
      body: {
        sign,
        timestamp,
        appkey: this.options.appKey,
      },
    });
    this._authToken = auth_token;

    // Token 有效期24小时，提前十分钟，即每过 23 小时 50 分钟刷新
    setTimeout(this.authSign.bind(this), 86340000);
  }

  public authClose(): Promise<any> {
    return this.request({
      url: `/auth_close`,
      body: {},
    })
  }

  /**
   * 对使用App的某个用户，单独推送消息
   *
   * 应用场景
   *   场景1：某用户发生了一笔交易，银行及时下发一条推送消息给该用户。
   *   场景2：用户定制了某本书的预订更新，当本书有更新时，
   *         需要向该用户及时下发一条更新提醒信息。
   *
   *  这些需要向指定某个用户推送消息的场景，即需要使用对单个用户推送消息的接口。
   *
   * @param {SingleMessage} message
   * @param {Target} target
   */
  public pushMessageToSingle(message: SingleMessage, target: Target): Promise<any> {
    const body = removeUndefined({
      message: message.getData(),
      [message.msgType]: message.getTemplateData(),
      cid: target.cid,
      alias: target.alias,
      push_info: message.getPushInfo(),
      requestid: getRequestId(),
    });
    body.message.appkey = this.options.appKey;
    console.log(body);
    return this.request({
      url: '/push_single',
      body,
    });
  }

  /**
   * 批量发送单推消息
   *
   * 应用场景
   *   1. 在给每个用户的推送内容都不同的情况下，又因为单推消息发送较慢，可以使用此接口。
   *
   * @param {BatchTask[]} batches
   */
  public pushMessageToSingleBatch(batches: BatchTask[]): Promise<any> {
    const list = _.map(batches, (batch) => {
      const message: SingleMessage = batch.message;
      const target: Target = batch.target;
      const data = {
        message: message.getData(),
        [message.msgType]: message.getTemplateData(),
        cid: target.cid,
        alias: target.alias,
        push_info: message.getPushInfo(),
        requestid: getRequestId(),
      };
      data.message.appkey = this.options.appKey;
      return data;
    });
    return this.request({
      url: '/push_single_batch',
      body: {
        msg_list: list,
        need_detail: true,
      },
    });
  }

  /**
   * 对单个或多个指定应用的所有用户群发推送消息。
   *
   * 应用场景
   *   场景1，某app周年庆，群发消息给该app的所有用户，提醒用户参加周年庆活动。
   *
   * @param {AppMessage} message
   * @param {string} [taskName = undefined]
   * @param {number} [speed = 0]
   */
  public pushMessageToApp(message: AppMessage, taskName: string = void 0, speed: number = 0): Promise<any> {
    const body = removeUndefined({
      message: message.getData(),
      [message.msgType]: message.getTemplateData(),
      condition: message.getConditions(),
      push_info: message.getPushInfo(),
      requestid: getRequestId(),
      speed: speed,
      task_name: taskName,
    });
    body.message.appkey = this.options.appKey;
    return this.request({
      url: '/push_app',
      body,
    });
  }

  public async saveListBody(message: ListMessage, taskName) {
    const body = {
      message: message.getData(),
      [message.msgType]: message.getTemplateData(),
      push_info: message.getPushInfo(),
      task_name: taskName,
    };
    body.message.appkey = this.options.appKey;
    return this.request({
      url: '/save_list_body',
      body,
    });
  }

  /**
   * 上传clientid或别名列表，对列表中所有clientid或别名用户进行消息推送，
   * 如果仅对单个用户推送务必使用单推接口，
   * 否则会严重影响推送性能，如果对少量甚至几个用户推送同样的消息，
   * 建议使用单推实现，性能会更高
   *
   * 应用场景
   *   场景1：对于抽奖活动的应用，需要对已知的某些用户推送中奖消息，
   *         就可以通过clientid列表方式推送消息。
   *   场景2：向新客用户发放抵用券，提升新客的转化率，就可以事先提取新客列表，
   *         将消息指定发送给这部分指定clientid用户
   *
   * @param {ListMessage} message
   * @param {TargetList} list
   * @param {string} [taskName = undefined]
   */
  public async pushMessageToList(message: ListMessage, list: TargetList, taskName: string = void 0): Promise<any> {
    const { taskid } = await this.saveListBody(message, taskName);

    const body = {
      taskid,
      cid: list.cid,
      alias: list.alias,
      need_detail: true,
    }
    return this.request({
      url: '/push_list',
      body,
    });
  }

  /**
   * 在有效期内的消息进行停止
   * @param {string} taskId
   */
  public async stopTask(taskId: string): Promise<any> {
    return this.request({
      method: 'DELETE',
      url: `/stop_task/${taskId}`,
    });
  }
}
