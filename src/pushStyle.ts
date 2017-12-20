import * as _ from 'lodash';
import { removeUndefined } from './util';

export class Style {
  /**
   * 收到通知是否响铃：true响铃，false不响铃。默认响铃
   */
  isRing: boolean = true;
  /**
   * 收到通知是否振动：true振动，false不振动。默认振动
   */
  isVibrate: boolean = true;
  /**
   * 通知是否可清除： true可清除，false不可清除。默认可清除
   */
  isClearable: boolean = true;
  /**
   * 通知的图标名称，包含后缀名（需要在客户端开发时嵌入），如“push.png”
   */
  logo: string;

  toObject() {
    return removeUndefined({
      is_ring: this.isRing,
      is_vibrate: this.isVibrate,
      is_clearable: this.isClearable,
      logo: this.logo,
    });
  }
}

/**
 * 系统样式
 */
export class SystemStyle extends Style {
  readonly type: number = 0;
  /**
   * 通知标题
   */
  text: string;
  /**
   * 通知内容
   */
  title: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      type: this.type,
      text: this.text,
      title: this.title,
    }));
  }
}

/**
 * 个推样式
 */
export class GetuiStyle extends Style {
  readonly type: number = 1;
  /**
   * 通知标题
   */
  text: string;
  /**
   * 通知内容
   */
  title: string;
  /**
   * 通知图标URL地址
   */
  logoUrl: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      type: this.type,
      text: this.text,
      title: this.title,
      logourl: this.logoUrl,
    }));
  }
}

/**
 * 纯图样式(背景图样式)
 */
export class ImageStyle extends Style {
  readonly type: number = 4;
  /**
   * 通过url方式指定动态banner图片作为通知背景图
   */
  bannerUrl: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      type: this.type,
      banner_url: this.bannerUrl,
    }));
  }
}

/**
 * 展开通知样式
 */
export class ExpandStyle extends Style {
  readonly type: number = 6;
  /**
   * 通知标题
   */
  text: string;
  /**
   * 通知内容
   */
  title: string;
  /**
   * 通知图标URL地址
   */
  logoUrl: string;
  /**
   * 通知展示样式,枚举值包括 1,2,3
   */
  bigStyle: string;
  /**
   * 通知大图URL地址
   */
  bigImageUrl: string;
  /**
   * 通知展示文本+长文本样式，参数是长文本
   */
  bigText: string;
  /**
   * 通知小图URL地址
   */
  bannerUrl: string;

  public toObject(): any {
    return removeUndefined(_.assign(super.toObject(), {
      type: this.type,
      text: this.text,
      title: this.title,
      logourl: this.logoUrl,
      big_style: this.bigStyle,
      big_image_url: this.bigImageUrl,
      big_text: this.bigText,
      banner_url: this.bannerUrl,
    }));
  }
}

