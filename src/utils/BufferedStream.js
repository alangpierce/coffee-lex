/* @flow */

import type SourceLocation from '../SourceLocation.js';
import type SourceType from '../SourceType.js';
import { EOF } from '../index.js';

export default class BufferedStream {
  _getNextLocation: () => SourceLocation;
  pending: Array<SourceLocation> = [];

  constructor(stream: () => SourceLocation) {
    this._getNextLocation = stream;
    while (true) {
      let loc: SourceLocation = stream();
      this.pending.push(loc);
      if (loc.type === EOF) {
        return;
      }
    }
  }

  shift(): SourceLocation {
    return this.pending.shift() || this._getNextLocation();
  }

  hasNext(...types: Array<SourceType>): boolean {
    let locationsToPutBack = [];
    let result = types.every(type => {
      let next = this.shift();
      locationsToPutBack.push(next);
      return next.type === type;
    });
    this.unshift(...locationsToPutBack);
    return result;
  }

  peek(): SourceLocation {
    let result = this.shift();
    this.unshift(result);
    return result;
  }

  unshift(...tokens: Array<SourceLocation>) {
    this.pending.unshift(...tokens);
  }
}
