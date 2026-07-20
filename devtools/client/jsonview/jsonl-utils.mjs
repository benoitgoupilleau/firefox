/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Represents one line of a JSON Lines document that failed to parse
 * as JSON. `raw` and `message` are non-enumerable so this behaves as
 * a leaf node in the JSON tree view (no expand toggle, no children).
 */
export class JsonlLineError {
  constructor(raw, message) {
    Object.defineProperties(this, {
      raw: { value: raw, enumerable: false },
      message: { value: message, enumerable: false },
    });
  }

  toJSON() {
    return { error: this.message, raw: this.raw };
  }
}
