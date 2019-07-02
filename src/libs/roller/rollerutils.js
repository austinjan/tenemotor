import { Subject } from "rxjs";

import { filter, tap } from "rxjs/operators";

const electron = require("electron");
const dgram = electron.remote.require("dgram");

const Op = {
  intro: 0xa0,
  roller: 0xa1,
  json: 0xa2,
  atop_invite: 0x02
};

/**
 * @description Make package will send to Tene roller control card.
 * @param {object} settings {command:byte, rw: 0x00|0x01, data: Uint8Array}

 * @returns {Array} roller package array
 */
function makeRollerPackage(settings) {
  const { command = 0x00, rw = 0x01, data = new Uint8Array() } = settings;

  let length = data.length || 0;
  length += 2;
  let rawPackage = [0x55, length, command, rw];
  let checkSum = 0;
  checkSum += command;
  checkSum += rw;
  data.forEach(v => {
    rawPackage.push(v);
    checkSum += v;
  });
  rawPackage.push(checkSum & 255);
  rawPackage.push(0x00);

  return rawPackage;
}

/**
 * @return {Uint8Array} message
 */
function makeIntroMessage() {
  let message = [0xa0, 0x00, 0x00, 0x00];
  message = message.concat(makeRollerPackage({}));
  return new Uint8Array(message);
}

function makeRollerMessage(data, Left = true) {
  let id = data.messageNo || 0x00;
  let message = [0xa1, id, 0x00, 0x00];
  message = message.concat(makeRollerPackage({ ...data }));

  return new Uint8Array(message);
}

//Return uint8Array (size=400)
function makeAtopInviteMessage() {
  const buffer = new Uint8Array(400);
  buffer[0] = 0x02;
  buffer.set([0x92, 0xda, 0x00, 0x00], 4);
  return buffer;
}

function makeMessage(op, data) {
  switch (op) {
    case Op.atop_invite:
      return makeAtopInviteMessage();
    case Op.intro:
      return makeIntroMessage();

    case Op.roller:
      return makeRollerMessage(data);

    case Op.json:
      return data;

    default:
      return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
  }
}

function test() {
  console.log("TEST");
  const subject = new Subject();
  const sender$ = subject.pipe(
    filter(v => v.ip && v.port && v.data),
    tap(v => {
      console.log("pass! ", v);
    })
  );

  sender$.subscribe(v => console.log(v));
  subject.next(1);
  subject.next({ ip: 111, data: 123, port: 456 });
}

// return true, false
function isRollerMessage(msg) {
  const isArr = msg instanceof Uint8Array || Array.isArray(msg);
  if (!isArr) {
    return false;
  }
  if (msg.length < 10) {
    return false;
  }
  if (msg[4] !== 0x55) {
    return false;
  }
  return true;
}

function isJSONMessage(message) {
  let buffer = Uint8Array.from(message);
  let op = String.fromCharCode(...buffer.subarray(0, 2));
  if (op === "JS") {
    try {
      let length = buffer.length - 4;
      let json = String.fromCharCode(...buffer.subarray(4, length + 4));
      JSON.parse(json);
      return json;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

const RollerParser = {
  isRollerMessage: msg => isRollerMessage(msg),
  isJSONMessage: msg => isJSONMessage(msg),
  parse: msg => {
    if (isRollerMessage(msg)) {
      return { type: "roller", message: msg };
    } else {
      const json = isJSONMessage(msg);
      if (json) {
        return { type: "json", message: json };
      } else {
        return { type: "undefined", message: {} };
      }
    }
  },
  valid: msg => isRollerMessage(msg) || isJSONMessage(msg)
};
export { Op, makeMessage, test, RollerParser };
