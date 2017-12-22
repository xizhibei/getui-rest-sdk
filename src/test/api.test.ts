import test from 'ava';

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
} from '../';

let gt: Getui;

test.before(async t => {
  const option: GetuiOption = {
    appId: process.env.GETUI_APP_ID,
    appSecret: process.env.GETUI_APP_SECRET,
    appKey: process.env.GETUI_APP_KEY,
    masterSecret: process.env.GETUI_MASTER_SECRET,
  };

  gt = new Getui(option);
  await gt.authSign();
})

test.after.always(async t => {
  await gt.authClose();
})

test('#test single', async t => {
  const alert = new Alert();
  alert.title = 'push test';
  alert.body = 'single push';

  const payload = JSON.stringify({
    message: 'single push message',
  });

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;

  const template = new TransmissionTemplate();
  template.transmissionContent = payload;
  const message = new SingleMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = new Target();
  target.cid = process.env.GETUI_CID;

  const ret = await gt.pushMessageToSingle(message, target);
  console.log(ret);
  t.is(ret.result, 'ok');
});

test('#test app', async t => {
  const alert = new Alert();
  alert.title = 'push test';
  alert.body = 'app push';

  const payload = JSON.stringify({
    message: 'app push message',
  });

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;

  const template = new TransmissionTemplate();
  template.transmissionContent = payload;

  let cond = new Condition(ConditionKey.TAG, ['test-tag'], CondOptType.OR);

  const message = new AppMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;
  message.conditions = [cond];

  const ret = await gt.pushMessageToApp(message)
  console.log(ret);
  t.is(ret.result, 'ok');
});

test('#test list', async t => {
  const alert = new Alert();
  alert.title = 'push test';
  alert.body = 'list push';

  const payload = JSON.stringify({
    message: 'list push message',
  });

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;

  const template = new TransmissionTemplate();
  template.transmissionContent = payload;
  const message = new ListMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = new TargetList();
  target.cid = [process.env.GETUI_CID];

  const ret = await gt.pushMessageToList(message, target);
  console.log(ret);
  t.is(ret.result, 'ok');
});

test('#test single batch', async t => {
  const alert = new Alert();
  alert.title = 'push test';
  alert.body = 'single batch push';

  const payload = JSON.stringify({
    message: 'single push message batch',
  });

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;

  const template = new TransmissionTemplate();
  template.transmissionContent = payload;
  const message = new SingleMessage();
  message.template = template;
  message.apnsInfo = apnsInfo;

  const target = new Target();
  target.cid = process.env.GETUI_CID;

  const bsmsg: BatchTask = {
    message,
    target,
  };

  const ret = await gt.pushMessageToSingleBatch([bsmsg]);
  console.log(ret);
  t.is(ret.result, 'ok');
});
