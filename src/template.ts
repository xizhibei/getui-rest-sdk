import * as _ from 'lodash';
import { Style } from './pushStyle';
import { removeUndefined } from './util';

export class BaseTemplate {
  type: string;
  /**
   * 设定展示开始时间，格式为yyyy-MM-dd HH:mm:ss
   */
  durationBegin: string;

  /**
   * 设定展示结束时间，格式为yyyy-MM-dd HH:mm:ss
   */
  durationEnd: string;

  public toObject(): any {
    return removeUndefined({
      duration_begin: this.durationBegin,
      duration_end: this.durationEnd,
    });
  }
}

/**
 * 在通知栏显示一条含图标、标题等的通知，用户点击后，会激活您的应用
 */
export class NotificationTemplate extends BaseTemplate {
  type: string = 'notification';

  /**
   * 收到消息是否立即启动应用，true 为立即启动，false 则广播等待启动，默认是否
   */
  transmissionType: boolean = false;

  /**
   * 透传内容
   */
  transmissionContent: string;

  /**
   * 通知栏消息布局样式
   */
  style: Style;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      transmission_type: this.transmissionType,
      transmission_content: this.transmissionContent,
      style: this.style && this.style.toObject(),
    }));
  }
}

/**
 * 当使用link作为推送模板时，当客户收到通知时，
 * 在通知栏会下是一条含图标、标题等的通知，
 * 用户点击时，可以打开您指定的网页
 */
export class LinkTemplate extends BaseTemplate {
  type: string = 'link';

  /**
   * 打开网址
   */
  url: string;
  /**
   * 通知栏消息布局样式
   */
  style: Style;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      url: this.url,
      style: this.style && this.style.toObject(),
    }));
  }
}

/**
 * 当使用该模板进行消息通知时，在通知栏会显示一条包含图标、标题等的通知。
 * 用户点击弹框内容是，可以选择直接下载应用，或者取消下载应用。
 */
export class NotypoploadTemplate extends BaseTemplate {
  type: string = 'notypopload';

  /**
   * 通知栏图标
   */
  notyIcon: string;
  /**
   * 通知标题
   */
  notyTitle: string;
  /**
   * 通知内容
   */
  notyContent: string;
  /**
   * 弹出框标题
   */
  popTitle: string;
  /**
   * 弹出框内容
   */
  popContent: string;
  /**
   * 弹出框图标
   */
  popImage: string;
  /**
   * 弹出框左边按钮名称
   */
  popButton1: string;
  /**
   * 弹出框右边按钮名称
   */
  popButton2: string;
  /**
   * 下载图标
   */
  loadIcon: string;
  /**
   * 下载标题
   */
  loadTitle: string;
  /**
   * 下载文件地址
   */
  loadUrl: string;
  /**
   * 是否自动安装，默认值false
   */
  isAutoInstall: boolean;
  /**
   * 安装完成后是否自动启动应用程序，默认值false
   */
  isActived: boolean;
  /**
   * 安卓标识
   */
  androidMark: string;
  /**
   * 塞班标识
   */
  symbianMark: string;
  /**
   * 苹果标志
   */
  iphoneMark: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      notyicon: this.notyIcon,
      notytitle: this.notyTitle,
      notycontent: this.notyContent,
      poptitle: this.popTitle,
      popcontent: this.popContent,
      popimage: this.popImage,
      popbutton1: this.popButton1,
      popbutton2: this.popButton2,
      loadicon: this.loadIcon,
      loadtitle: this.loadTitle,
      loadurl: this.loadUrl,
      is_autoinstall: this.isAutoInstall,
      is_actived: this.isActived,
      androidmark: this.androidMark,
      symbianmark: this.symbianMark,
      iphonemark: this.iphoneMark,
    }));
  }
}

/**
 * 透传消息是指消息传递到客户端只有消息内容，展现的形式由客户端自行定义。
 * 客户端可自定义通知的展现形式，可以自定义通知到达后的动作，
 * 或者不做任何展现。IOS推送也使用该模板
 */
export class TransmissionTemplate extends BaseTemplate {
  type: string = 'transmission';

  /**
   * 收到消息是否立即启动应用，true 为立即启动，false 则广播等待启动，默认是否
   */
  transmissionType: boolean = false;

  /**
   * 透传内容
   */
  transmissionContent: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      transmission_type: this.transmissionType,
      transmission_content: this.transmissionContent,
    }));
  }
}
