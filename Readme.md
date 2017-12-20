# Getui Rest SDK

### Getting Started

详细原接口文档：http://docs.getui.com/server/rest/start/

*Warning*: 未经严格测试，尚未正式发布

### Installing

```
npm i getui-rest-sdk --save
```

### Usage

单推

```ts
import Getui, {
  GetuiOption,
  ApnsInfo,
  Alert,
  SingleMessage,
  Target,
  TransmissionTemplate,
} from 'getui-rest-sdk'

(async () => {
  const option: GetuiOption = {
    appId: 'appId',
    appSecret: 'appSecret',
    appKey: 'appKey',
    masterSecret: 'masterSecret',
  };

  const gt: Getui = new Getui(option);

  await gt.authSign();

  // Init the apnsinfo
  const alert = new Alert();
  alert.title = 'This is a push test';
  alert.body = 'single push';

  const apnsInfo = new ApnsInfo();
  apnsInfo.alert = alert;

  // Init template
  const template = new TransmissionTemplate();
  template.transmissionContent = JSON.stringify({
    data: '123',
  });

  // Assign apnsinfo and template to the message
  const message = new SingleMessage();
  message.apnsInfo = apnsInfo;
  message.template = template;

  const target = new Target();
  target.cid = 'example-cid';

  const ret = await gt.pushMessageToSingle(message, target);
  console.log(ret);

  await gt.authClose();
});

```


### TODO
- 其它接口
- 测试代码完善

### License
This project is licensed under the MIT License - see the LICENSE file for details
