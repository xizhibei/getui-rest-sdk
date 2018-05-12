import * as nock from 'nock';

const testnock = nock('https://restapi.getui.com/');

export default function setUpNock(appId) {
  const pathPrefix = `/v1/${appId}`;
  testnock.post(`${pathPrefix}/auth_sign`)
    .reply(200, {
      result: 'ok',
      auth_token: 'test_token',
      expire_time: Date.now() + 8640000,
    });

  testnock.post(`${pathPrefix}/auth_close`)
    .reply(200, {
      result: 'ok',
    });

  testnock.post(`${pathPrefix}/push_by_tag`)
    .reply(200, {
      result: 'ok',
    });

  testnock.post(`${pathPrefix}/push_single`)
    .reply(200, {
      result: 'ok',
    });

  testnock.post(`${pathPrefix}/save_list_body`)
    .reply(200, {
      result: 'ok',
      taskid: 'test_taskid',
    });

  testnock.post(`${pathPrefix}/push_app`)
    .reply(200, {
      result: 'ok',
      taskid: 'test_taskid',
    });

  testnock.post(`${pathPrefix}/push_single_batch`)
    .reply(200, {
      result: 'ok',
    });

  testnock.post(`${pathPrefix}/push_list`)
    .reply(200, {
      result: 'ok',
    });
}
