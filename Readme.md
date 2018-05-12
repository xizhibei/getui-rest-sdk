# Getui Rest SDK

[![Build Status](https://travis-ci.org/xizhibei/getui-rest-sdk.svg?branch=master&style=flat)](https://travis-ci.org/xizhibei/getui-rest-sdk)
[![npm version](https://badge.fury.io/js/getui-rest-sdk.svg?style=flat)](http://badge.fury.io/js/getui-rest-sdk)
[![Dependency Status](https://img.shields.io/david/xizhibei/getui-rest-sdk.svg?style=flat)](https://david-dm.org/xizhibei/getui-rest-sdk)
[![npm](https://img.shields.io/npm/l/getui-rest-sdk.svg)](https://github.com/xizhibei/getui-rest-sdk/blob/master/LICENSE)

### Getting Started

详细原接口文档：http://docs.getui.com/server/rest/start/

> 除了原文档中的接口，其中另外还提供了 `pushMessageByTag` 方法，可以用来发送按 tag 或者说按 topic 方式推送数据。

### Installing

```bash
npm i getui-rest-sdk --save
```

建议使用 vscode 开发，typing 代码提示更加完善

### Usage

以下样例均使用 TypeScript 展示，可轻易修改为 ES6

##### 初始化

```ts
const option: GetuiOption = {
  appId: APP_ID,
  appSecret: APP_SECRET,
  appKey: APP_KEY,
  masterSecret: MASTER_SECRET,
};

const gt = new Getui(option);
await gt.authSign();
```

##### 初始化透传模板

```ts
const alert = new Alert();
alert.title = 'Title: push test';
alert.body = `Body: push test`;

const payload = JSON.stringify({
  message: `Payload message: push message test`,
});

const apnsInfo = new ApnsInfo();
apnsInfo.alert = alert;
apnsInfo.customMsg = { payload };

const template = new TransmissionTemplate();
template.transmissionContent = payload;
```

##### 单个推送

```ts
const message = new SingleMessage();
message.template = template;
message.apnsInfo = apnsInfo;

const target = <Target>{
  cid: GETUI_CID,
};

const ret = await gt.pushMessageToSingle(message, target);
```

##### APP推送

```ts
const message = new AppMessage();
message.template = template;
message.apnsInfo = apnsInfo;
message.conditions = [
  new Condition(ConditionKey.TAG, [testTag], CondOptType.OR),
  new Condition(ConditionKey.Region, [Region.北京市], CondOptType.OR),
  new Condition(ConditionKey.PHONE_TYPE, [PhoneType.IOS], CondOptType.OR),
];

const ret = await gt.pushMessageToApp(message)
```

##### 按 tag 推送

```ts
const message = new TagMessage();
message.template = template;
message.apnsInfo = apnsInfo;
message.tag = testTag;

const ret = await gt.pushMessageByTag(message);
```

更多样例，请见测试代码

### Test

测试基于 nock 来模拟服务器，但是你可以设置环境变量与真实个推服务器测试进行交互，以下测试账号数据需要用你自己的

```bash
export GETUI_APP_ID=<app id>
export GETUI_APP_SECRET=<app secret>
export GETUI_APP_KEY=<app key>
export GETUI_MASTER_SECRET=<master secret>
export GETUI_CID=<cid>
export GETUI_TEST_TAG=<tag>

export GETUI_TEST_USE_REAL_CONNECTION=true

export DEBUG=getui

npm test
```

### TODO
- 测试代码完善

### License
This project is licensed under the MIT License - see the LICENSE file for details
