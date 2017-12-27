import * as _ from 'lodash';

import { BaseTemplate } from './template';
import { removeUndefined } from './util';
import { ApnsInfo } from './apnsInfo';

/**
 * 0:联网方式不限;1:仅wifi;2:仅4G/3G/2G
 */
export enum NetworkType {
  ANY = 0,
  WIFI = 1,
  CELLULAR = 2,
}

export interface Target {
  cid?: string;
  alias?: string;
}

export interface TargetList {
  /**
   * cid为cid list，与alias list二选一
   */
  cid?: string[];
  /**
   * alias为alias list，与cid list二选一
   */
  alias?: string[];
}

export class Message {
  /**
   * 是否离线发送
   */
  isOffline: boolean = true;
  /**
   * 离线过期时间
   */
  offlineExpireTime: number = 60 * 1000;
  /**
   * 网络类型
   */
  pushNetworkType: NetworkType = NetworkType.ANY;

  msgType: string;

  _template: BaseTemplate;
  apnsInfo: ApnsInfo;

  public getData(): any {
    return removeUndefined({
      is_offline: this.isOffline,
      offline_expire_time: this.offlineExpireTime,
      push_network_type: this.pushNetworkType,
      msgtype: this.msgType,
    });
  }

  public set template(template: BaseTemplate) {
    this._template = template;
    this.msgType = template.type;
  }

  public get template(): BaseTemplate {
    return this._template;
  }

  public getTemplateData(): any {
    return this._template && this._template.toObject();
  }

  public getPushInfo(): any {
    return this.apnsInfo.toObject();
  }
}

export class SingleMessage extends Message {
}

export interface BatchTask {
  message: SingleMessage;
  target: Target;
}

export class ListMessage extends Message {
}

export enum ConditionKey {
   PHONE_TYPE = 'phonetype',
   REGION = 'region',
   TAG = 'tag',
}

export enum CondOptType {
  OR = 0,
  AND = 1,
  NotIn = 2,
}

export class Condition {
  /**
   * 筛选条件类型名称(省市region,手机类型phonetype,用户标签tag)
   */
  key: ConditionKey;
  /**
   * 筛选参数
   */
  values: string[] = [];
  /**
   * 筛选参数的组合，0:取参数并集or，1：交集and，2：相当与not in {参数1，参数2，....}
   */
  optType: CondOptType;

  constructor (key, values, optType) {
    this.key = key;
    this.values = values;
    this.optType = optType;
  }

  public toObject(): any {
    return removeUndefined({
      key: this.key,
      values: this.values,
      opt_type: this.optType,
    });
  }
}

export class AppMessage extends Message {
  conditions: Condition[];

  public getConditions(): any {
    return _.map(this.conditions, c => c.toObject());
  }
}

export class TagMessage extends Message {
  /**
   * 用户的 tag
   */
  tag: string;
}

