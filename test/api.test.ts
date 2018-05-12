import test from 'ava';
import * as fs from 'fs';

import setUpNock from './fixtures/nock';

import Getui, {
  GetuiOption,
  ApnsInfo,
  Alert,
  SingleMessage,
  Target,
  AppMessage,
  Condition,
  ConditionKey,
  CondOptType,
  TargetList,
  ListMessage,
  BatchTask,
  TransmissionTemplate,
  TagMessage,
} from '../src';

const option: GetuiOption = {
  appId: process.env.GETUI_APP_ID || 'test_app_id',
  appSecret: process.env.GETUI_APP_SECRET || 'test_app_secret',
  appKey: process.env.GETUI_APP_KEY || 'test_app_key',
  masterSecret: process.env.GETUI_MASTER_SECRET || 'test_master_secret',
};

let gt: Getui;
const testTag = process.env.GETUI_TEST_TAG || 'test-tag';
const testCID = process.env.GETUI_CID || 'test-cid';

if (!process.env.GETUI_TEST_USE_REAL_CONNECTION) {
  setUpNock(option.appId);
}

test.before(async t => {
  gt = new Getui(option);
  await gt.authSign();
});

test.after.always(async t => {
  await gt.authClose();
});

function getApnsInfoAndTemplate(type: string): { apnsInfo: ApnsInfo, template: TransmissionTemplate } {
  const alert = new Alert();
  alert.title = 'Title: push test';
  alert.body = `Body: ${type} push test`;

  const payload = JSON.stringify({
    message: `Payload message: ${type} push message test`,
  });

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;
  apnsInfo.customMsg = { payload };

  const template = new TransmissionTemplate();
  template.transmissionContent = payload;
  return {
    apnsInfo,
    template,
  };
}

test('#test single', async t => {
  const { apnsInfo, template } = getApnsInfoAndTemplate('single');

  const message = new SingleMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = <Target>{
    cid: testCID,
  };

  const ret = await gt.pushMessageToSingle(message, target);
  t.is(ret.result, 'ok');
});

test('#test app', async t => {
  const { apnsInfo, template } = getApnsInfoAndTemplate('app');

  let cond = new Condition(ConditionKey.TAG, [testTag], CondOptType.OR);

  const message = new AppMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;
  message.conditions = [cond];

  const ret = await gt.pushMessageToApp(message);
  t.is(ret.result, 'ok');
});

test('#test tag', async t => {
  const { apnsInfo, template } = getApnsInfoAndTemplate('tag');

  const message = new TagMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;
  message.tag = testTag;

  const ret = await gt.pushMessageByTag(message);
  t.is(ret.result, 'ok');
});

test('#test list', async t => {
  const { apnsInfo, template } = getApnsInfoAndTemplate('list');

  const message = new ListMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = <TargetList>{
    cid: [process.env.GETUI_CID],
  };

  const ret = await gt.pushMessageToList(message, target);
  t.is(ret.result, 'ok');
});

test('#test single batch', async t => {
  const { apnsInfo, template } = getApnsInfoAndTemplate('single batch');

  const message = new SingleMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = <Target>{
    cid: testCID,
  };

  const bsmsg = <BatchTask>{
    message,
    target,
  };

  const ret = await gt.pushMessageToSingleBatch([bsmsg]);
  t.is(ret.result, 'ok');
});
