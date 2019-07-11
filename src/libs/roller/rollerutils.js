import { Subject } from "rxjs";
import { filter, tap } from "rxjs/operators";
import * as R from "ramda";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";

export const DEFAULT_UDP_BROADCASTING_PORT = 55954;

const Op = {
  intro: 0xa0,
  roller: 0xa1,
  json: 0xa2,
  atop_invite: 0x02,
  config: 0x00
};

/**
 * {command,rw,data,motoID} -> [Package]
 * @description Make package will send to Tene roller control card.
 * @param {object} settings {command:byte, rw: 0x00|0x01, data: Uint8Array, motorID}

 * @returns roller package array
 */
function makeRollerPackage(settings) {
  const settingWithDefault = R.mergeLeft(settings, {
    command: 0x00,
    rw: 0x01,
    data: new Uint8Array(),
    motorID: 0
  });
  console.log("makeRollerPackage: ", settingWithDefault);
  const { command, rw, data, motorID } = settingWithDefault;
  const _data = R.is(String, data) ? convertStringToByteArray(data) : data;
  const rwField = (rw & 0x0f) | ((motorID & 0x0f) << 4);
  let length = _data.length || 0;
  length += 2;
  let rawPackage = [0x55, length, command, rwField];
  let checkSum = 0;
  checkSum += command;
  checkSum += rwField;
  _data.forEach(v => {
    rawPackage.push(v);
    checkSum += v;
  });
  rawPackage.push(checkSum & 255);
  rawPackage.push(0x00);

  return rawPackage;
}

// asciiToArray('abc') =>
const asciiToArray = R.flip(R.invoker(1, "encode"))(new TextEncoder());

// option = {ip, oldip, subnet, gateway, host}
function makeConfigMessage(option) {
  console.log("makeConfigMessage: ", option);
  const splitDot = R.split(".");
  const splitColon = R.split(":");
  const toInts = R.compose(
    R.map(i => Number(i)),
    splitDot
  );

  const toHexs = R.compose(
    R.map(i => parseInt(i, 16)),
    splitColon
  );

  const buffer = new Uint8Array(400);
  const oldIP = toInts(option.oldip);
  const ip = toInts(option.ip);
  const subnet = toInts(option.subnet);
  const gateway = toInts(option.gateway);
  const mac = toHexs(option.mac);

  buffer.set([0x00, 0x01, 0x06, 0x00], 0); //head
  buffer.set([0x92, 0xda, 0x00, 0x00], 4); // transaction id
  buffer.set(oldIP, 12); // old ip
  buffer.set(ip, 16); // new ip
  buffer.set(gateway, 24); // gateway
  buffer.set(mac, 28); // mac
  buffer[70] = 0; // no Password
  buffer.set(asciiToArray("hhadev"), 90); //host name
  buffer.set(subnet, 236);
  buffer[236 + 19] = 0xff;

  return buffer;
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

/**
 *
 * @param {Op} op
 * @param {*} data
 * { command:byte, rw: 0x00|0x01, data: Uint8Array, motorID }roller package data or {} for other message
 *
 */
function makeMessage(op, data) {
  switch (op) {
    case Op.atop_invite:
      return makeAtopInviteMessage();
    case Op.intro:
      return makeIntroMessage();

    case Op.roller:
      return makeRollerMessage(data);

    case Op.config:
      return makeConfigMessage(data);

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

const isRollerHead = R.propEq(0, 0x55);
const isArray = R.anyPass([R.is(Array), R.is(Uint8Array)]);
const getRollerPackage = R.slice(4, Infinity);
const hadRollerPackage = R.compose(
  isRollerHead,
  getRollerPackage
);

const isRollerMessage = R.allPass([isArray, hadRollerPackage]);

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

//////////////////////////////////////////
// For roller package

const commandOption = [
  { value: 0, text: "InValid(0x00)" },
  { value: 1, text: "Phase Current" },
  { value: 2, text: "Period(0x02)" },
  { value: 3, text: "Temperature(0x03)" },
  { value: 4, text: "Fuzzy Member F(0x04)" },
  { value: 5, text: "GPIO Status(0x05)" },
  { value: 6, text: "Get Params(0x06)" },
  { value: 7, text: "Motor Run/Stop(0x07)" },
  { value: 8, text: "Motor Speed(0x08)" },
  { value: 0xe0, text: "Connet Device(0xE0)" }
];

// [pkg] -> Number
const getLength = pkg => pkg[1];

// a -> {value, text}
// Retrurn commandOption['value'] = a
const matchCommand = R.useWith(R.find, [R.propEq("value"), R.identity])(
  R.__,
  commandOption
);

// [] -> Number
const getCommand = R.prop(2);

// [] -> String
const getCommandText = R.compose(
  R.prop("text"),
  matchCommand,
  getCommand
);

// [pkg] -> Number
const getDataLength = R.compose(
  R.subtract(R.__, 2),
  getLength
);

// [pkg] -> Number
const getRWField = R.prop(3);

// Number -> {motorID, RW}
const splitRWField = v => ({ motorID: (v & 0xf0) >> 4, rw: v & 0x0f });

// [pkg] -> [data]
const getData = pkg => {
  const dataEnd = getDataLength(pkg) + 4;
  return R.slice(4, dataEnd)(pkg);
};

/**
 * @param pkg : (Array | Uint8Array) roller package
 * @returns {length, motorID, data, command, rw, commandText, string}
 */
const parseRollerPackage = pkg => {
  console.log("parseRollerPackage: ", pkg);
  const length = getLength(pkg);
  const RWField = R.compose(
    splitRWField,
    getRWField
  )(pkg);
  const motorID = R.prop("motorID")(RWField);
  const rw = R.prop("rw")(RWField);
  const data = getData(pkg);
  const commandText = getCommandText(pkg);
  const command = getCommand(pkg);
  const tostr = v => " 0x" + v.toString(16);
  const string = R.map(tostr)(pkg);
  const checkSum = pkg[getLength(pkg) + 2];
  return { length, motorID, rw, data, commandText, command, string, checkSum };
};

const MessageParser = {
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
export {
  Op,
  makeMessage,
  test,
  MessageParser as RollerParser,
  makeRollerPackage,
  parseRollerPackage
};
