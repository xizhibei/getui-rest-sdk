import { setTimeout } from 'timers';

import * as _ from 'lodash';
import * as rp from 'request-promise';
import * as createError from 'create-error';
import * as debug from 'debug';

import { Alias } from './other';
import {
  sha256,
  getRequestId,
  removeUndefined,
  getUserAgent
} from './util';
import {
  Target,
  SingleMessage,
  AppMessage,
  ListMessage,
  TagMessage,
  TargetList,
  BatchTask,
  Condition,
} from './message';

const log = debug('getui');

const GetuiError = createError('GetuiError', {
  code: 'GETUI_ERROR',
});

const USER_AGENT = getUserAgent();
log(`using user agent ${USER_AGENT}`);

const GETUI_BASE_URL: string = 'https://restapi.getui.com/v1';
log(`using getui base url ${GETUI_BASE_URL}`);

/**
 * 个推配置
 */
export interface GetuiOption {
  appId: string;
  appSecret: string;
  appKey: string;
  masterSecret: string;
}

/**
 * 个推所有的 rest 接口
 */
export default class Getui {
  public options: GetuiOption;
  private rp: any;
  private authToken: string;

  public constructor(options: GetuiOption) {
    this.options = options;

    this.rp = rp.defaults({
      baseUrl: `${GETUI_BASE_URL}/${this.options.appId}`,
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
      },
      json: true,
    });
  }

  private async request(params: any): Promise<any> {
    if (params.body) {
      params.body = removeUndefined(params.body);
    }
    if (this.authToken) {
      params.headers = {
        'User-Agent': USER_AGENT,
        authtoken: this.authToken,
      }
    }
    log(JSON.stringify(params.body, null, 2))
    const ret = await this.rp(params);
    if (ret.result !== 'ok') throw new GetuiError(ret.result, { detail: ret });
    return ret;
  }

  /**
   * 用户身份验证通过获得 auth_token 权限令牌，后面的请求都会自动带上 auth_token
   */
  public async authSign(): Promise<void> {
    const timestamp = _.now();
    const sign = sha256(`${this.options.appKey}${timestamp}${this.options.masterSecret}`);
    const { auth_token: authToken } = await this.request({
      url: `/auth_sign`,
      body: {
        sign,
        timestamp,
        appkey: this.options.appKey,
      },
    });
    this.authToken = authToken;

    // Token 有效期24小时，提前十分钟，即每过 23 小时 50 分钟刷新
    setTimeout(this.authSign.bind(this), 86340000);
  }

  /**
   * 将 auth_token 设为无效，以防止 auth_token 被其他人恶意使用
   */
  public async authClose(): Promise<any> {
    await this.request({
      url: `/auth_close`,
      body: {},
    });

    this.authToken = null;
  }

  /**
   * 一个ClientID只能绑定一个别名，若已绑定过别名的ClientID再次绑定新别名，
   * 则认为与前一个别名自动解绑，绑定新别名
   * 允许将多个ClientID和一个别名绑定，如用户使用多终端，
   * 则可将多终端对应的ClientID绑定为一个别名，
   * 目前一个别名最多支持绑定10个ClientID
   *
   * @param {Alias} aliasList
   */
  public bindAlias(aliasList: Alias[]): Promise<void> {
    const list = _.map(aliasList, (alias) => {
      return {
        cid: alias.cid,
        alias: alias.alias,
      }
    })
    return this.request({
      url: `/bind_alias`,
      body: {
        alias_list: list,
      },
    });
  }

  /**
   * 通过传入的别名查询对应的cid信息
   * @param {string} alias
   */
  public async queryCid(alias: string): Promise<string[]> {
    const { cid } = await this.request({
      method: 'GET',
      url: `/query_cid/${alias}`,
    });
    return cid;
  }

  /**
   * 通过传入的cid查询对应的别名
   * @param cid
   */
  public async queryAlias(cid: string): Promise<string> {
    const { alias } = await this.request({
      method: 'GET',
      url: `/query_alias/${cid}`,
    });
    return alias;
  }

  /**
   * 单个cid和别名解绑
   * @param {string} cid
   * @param {string} alias
   */
  public async unbindAlias(cid: string, alias: string): Promise<void> {
    await this.request({
      url: `/unbind_alias`,
      body: {
        cid,
        alias,
      },
    });
    return;
  }

  /**
   * 解绑别名所有cid
   * @param {string} alias
   */
  public async unbindAliasAll(alias: string): Promise<void> {
    await this.request({
      url: `/unbind_alias_all`,
      body: {
        alias,
      },
    });
    return;
  }

  /**
   * 对指定用户设置tag属性
   * @param {string} cid
   * @param {string[]} tags
   */
  public async setTags(cid: string, tags: string[]): Promise<void> {
    await this.request({
      url: `/set_tags`,
      body: {
        cid,
        tag_list: tags,
      },
    });
    return;
  }

  /**
   * 查询指定用户tag属性
   * @param {string} cid
   */
  public async getTags(cid: string): Promise<string[]> {
    const { tags } = await this.request({
      method: 'GET',
      url: `/get_tags/${cid}`,
    });
    return tags;
  }

  /**
   * 黑名单用户管理
   * @param {string[]} cidList
   */
  public async addUserToBlackList(cidList: string[]): Promise<void> {
    await this.request({
      url: `/user_blk_list`,
      body: {
        cid: cidList,
      },
    });
    return;
  }

  /**
   * 移除黑名单用户
   * @param {string[]} cidList
   */
  public async removeUserFromBlackList(cidList: string[]): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/user_blk_list`,
      body: {
        cid: cidList,
      },
    });
    return;
  }

  /**
   * 查询用户状态
   * 调用此接口可获取用户状态，如在线不在线
   * @param {string} cid
   */
  public async getUserStatus(cid: string): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/user_status/${cid}`,
    });
    return data;
  }

  /**
   * 获取推送结果接口
   * 调用此接口查询推送数据，可查询消息有效可下发总数，消息回执总数和用户点击数等结果。
   * @param {string[]} taskIdList
   */
  public async getPushResult(taskIdList: string[]): Promise<any> {
    const data = await this.request({
      url: `/push_result`,
      body: {
        taskIdList,
      },
    });
    return data;
  }

  /**
   * 根据任务组名获取推送结果数据
   * 根据任务组名查询推送结果，返回结果包括百日内联网用户数（活跃用户数）、实际下发数、到达数、展示数、点击数。
   * @param {string} groupName
   */
  public async getPushResultByGroupName(groupName): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/get_push_result_by_group_name/${groupName}`,
    });
    return data;
  }

  /**
   * 获取单日用户数据接口
   * 调用此接口查询推送数据，可查询消息有效可下发总数，消息回执总数和用户点击数等结果。
   * @param {string} date - 日期，格式为 YYYYMMDD
   */
  public async queryAppUser(date: string): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/query_app_user/${date}`,
    });
    return data;
  }

  /**
   * 获取单日推送数据接口
   * 调用此接口可以获取某个应用单日的推送数据（推送数据包括：发送总数，在线发送数，接收数，展示数，点击数）
   * @param {string} date - 日期，格式为 YYYYMMDD
   */
  public async queryAppPush(date: string): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/query_app_push/${date}`,
    });
    return data;
  }

  /**
   * 获取24小时在线用户数
   * 通过接口查询当前时间一天内的在线数（十分钟一个点，一小时六个点）
   */
  public async getLast24HoursOnlineUserStatistics(): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/get_last_24hours_online_User_statistics`,
    });
    return data;
  }

  /**
   * 应用角标设置接口(仅iOS)
   * 设置iOS用户应用icon上显示的数字
   * @param {number} badge
   * @param {string[]} cidList
   * @param {deviceTokenList} deviceTokenList
   */
  public async setBadge(badge: number, cidList: string[] = [], deviceTokenList: string[] = []): Promise<any> {
    const data = await this.request({
      url: `/set_badge`,
      body: {
        badge,
        cid_list: cidList,
        devicetoken_list: deviceTokenList,
      },
    });
    return data;
  }

  /**
   * 按条件查询用户数
   * 通过指定查询条件来查询满足条件的用户数量
   *
   * @param {Condition[]} conditions
   * @returns {Promise<number>} User Count
   */
  public async queryUserCount(conditions: Condition[]): Promise<number> {
    const { user_count: userCount } = await this.request({
      url: `/query_user_count`,
      body: {
        condition: _.map(conditions, cond => cond.toObject()),
      },
    });
    return userCount;
  }

  /**
   * 获取回执的用户列表
   * 查询有回执的用户列表
   *
   * @param {string} taskId
   * @param {string[]} cids
   */
  public async getFeedbackUsers(taskId: string, cids: string[]): Promise<any> {
    const data = await this.request({
      url: `/get_feedback_users`,
      body: {
        data: {
          taskId,
          cids,
        }
      },
    });
    return data;
  }

  /**
   * 获取可用bi标签
   * 查询应用可用的bi标签列表
   */
  public async queryBITags(): Promise<any> {
    const data = await this.request({
      method: 'GET',
      url: `/query_bi_tags`,
    });
    return data;
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
      speed,
      task_name: taskName,
    });
    body.message.appkey = this.options.appKey;
    return this.request({
      url: '/push_app',
      body,
    });
  }

  /**
   * 针对某个 appid 根据 tag 条件筛选，将消息群发给符合条件客户群
   *
   * @param {TagMessage} message
   * @param {number} [speed = 0]
   */
  public pushMessageByTag(message: TagMessage, speed: number = 0): Promise<any> {
    const body = removeUndefined({
      message: message.getData(),
      tag: message.tag,
      [message.msgType]: message.getTemplateData(),
      push_info: message.getPushInfo(),
      requestid: getRequestId(),
      speed,
    });
    body.message.appkey = this.options.appKey;
    return this.request({
      url: '/push_by_tag',
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
