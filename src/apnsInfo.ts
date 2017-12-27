import * as _ from 'lodash';
import { removeUndefined } from './util';

export class Alert {
  /**
   * 通知文本消息
   */
  body: string;
  /**
   * （用于多语言支持）指定执行按钮所使用的Localizable.strings
   */
  actionLocKey: string;
  /**
   * （用于多语言支持）指定Localizable.strings文件中相应的key
   */
  locKey: string;
  /**
   * 如果loc-key中使用了占位符，则在loc-args中指定各参数
   */
  locArgs: string;
  /**
   * 指定启动界面图片名
   */
  launchImage: string;
  /**
   * 通知标题
   */
  title: string;
  /**
   * (用于多语言支持）对于标题指定执行按钮所使用的Localizable.strings,仅支持iOS8.2以上版本
   */
  titileLocKey: string;
  /**
   * 对于标题,如果loc-key中使用的占位符，则在loc-args中指定各参数,仅支持iOS8.2以上版本
   */
  titleLocArgs: string;
  /**
   * 通知子标题,仅支持iOS8.2以上版本
   */
  subtitle: string;
  /**
   * 当前本地化文件中的子标题字符串的关键字,仅支持iOS8.2以上版本
   */
  subtitleLocKey: string;
  /**
   * 当前本地化子标题内容中需要置换的变量参数 ,仅支持iOS8.2以上版本
   */
  subtitleLocArgs: string;

  public toObject(): any {
    return removeUndefined({
      body: this.body,
      'action-loc-key': this.actionLocKey,
      'loc-key': this.locKey,
      'loc-args': this.locArgs,
      'launch-image': this.launchImage,
      title: this.title,
      'titile-loc-key': this.titileLocKey,
      'title-loc-args': this.titleLocArgs,
      subtitle: this.subtitle,
      'subtitle-loc-key': this.subtitleLocKey,
      'subtitle-loc-args': this.subtitleLocArgs,
    });
  }
}

/**
 *  资源类型
 *  1.图片，2.音频， 3.视频
 */
export enum MultimediaType {
  IMAGE = 1,
  AUDIO = 2,
  VIDEO = 3,
}

export class Multimedia {
  /**
   * 多媒体资源地址
   */
  url: string;
  /**
   * 资源类型
   */
  type: MultimediaType;
  /**
   * 是否只在wifi环境下加载，如果设置成true,但未使用wifi时，会展示成普通通知
   */
  onlyWifi: boolean;

  public toObject(): any {
    return removeUndefined({
      url: this.url,
      type: this.type,
      only_wifi: this.onlyWifi,
    });
  }
}

/**
 * 具体参数含义详见苹果APNs文档：
 * https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html
 */
export class ApnsInfo {
  /**
   * 消息
   */
  alert: Alert;
  /**
   * 用于计算icon上显示的数字，还可以实现显示数字的自动增减，如“+1”、 “-1”、 “1” 等，计算结果将覆盖badge
   */
  autoBadge: string = '+1';
  /**
   * 通知铃声文件名，无声设置为“com.gexin.ios.silence”
   */
  sound: string;
  /**
   * 推送直接带有透传数据
   */
  contentAvailable: number = 1;
  /**
   * 在客户端通知栏触发特定的action和button显示
   */
  category: string;

  /**
   * 该字段为Array类型，最多可设置3个子项
   */
  multimedias: Multimedia[];

  /**
   * 该字段为 apn 推送的自定义数据，必须为 object
   */
  customMsg: Object = {};

  public toObject(): any {
    const pushInfo = {
      aps: removeUndefined({
        alert: this.alert.toObject(),
        autoBadge: this.autoBadge,
        sound: this.sound,
        'content-available': this.contentAvailable,
        category: this.category,
      }),
      multimedia: _.map(this.multimedias, m => m.toObject()),
    };
    return _.assign({}, this.customMsg, pushInfo);
  }
}
