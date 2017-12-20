import * as crypto from 'crypto';

import * as _ from 'lodash';
import * as uuid from 'uuid';

export function sha256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').toString();
}

export function getRequestId(): string {
  return uuid.v1().replace(/-/g, '').slice(0, 30);
}

export function removeUndefined(obj: any): any {
  return _.pickBy(obj, (v) =>  !_.isUndefined(v));
}
