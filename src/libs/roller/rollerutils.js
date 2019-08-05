// @flow
import { Subject } from "rxjs";
import { filter, tap } from "rxjs/operators";
import * as R from "ramda";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";
import type { tRollerSettings } from "./rollerType";
export const DEFAULT_UDP_BROADCASTING_PORT = 55954;

const Op = {
  intro: 0xa0,
  roller: 0xa1,
  json: 0xa2,
  atop_invite: 0x02,
  get_settings: 0xb0,
  set_settings: 0xb1,
  config: 0x00
};

type tRollerCommand = {
  command: Number,
  rw: Number,
  data: Array<number> | Uint8Array,
  motorID: Number
};
/**
 * {command,rw,data,motoID} -> [Package]
 * @description Make package will send to Tene roller control card.
 * @param {object} settings {command:byte, rw: 0x00|0x01, data: Uint8Array, motorID}

 * @returns roller package array
 */
function makeRollerPackage(settings: tRollerCommand) {
  const settingWithDefault = R.mergeLeft(settings, {
    command: 0x00,
    rw: 0x01,
    // $FlowFixMe
    data: new Uint8Array(),
    motorID: 0
  });

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
  buffer.set(asciiToArray("any"), 90); //host name
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

function makeGetSettingMessage() {
  //let message = [0xb1,0x00]

  const msg = new Uint8Array(4);
  msg.set([0xb0, 0x00, 0x00, 0x00], 0);
  // const dv = new DataView(msg.buffer);
  // dv.setUint16(2, pkg.length, true);
  // msg.set(pkg, 4);
  // console.log("makeSetSettingMessage ", data, pkg.length);
  return msg;
}

function toNum(x) {
  var parsed = parseInt(x, 10);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

// [192.168.33.11] => "192.168.33.11"

// "192.168.33.11" -> [192,168,33,11]
const ip2array = R.compose(
  R.map(toNum),
  R.split(".")
);

const chksum = R.compose(
  i => i & 0xffff,
  R.reduce(R.add, 0)
);

const VERSION = 1;
const PKGLENGTH = 56;
/**
 * Make roller message for set settings in to roller.
 * @param {string} data json string of settings.
 * Package
 * [ eoz | pe | halfSpeed | speed | currentSpeed | jamExprTime | ramExprTime | mode |
 * forceNeighborIP | upperIP.1 | upperIP.2 | upperIP.3 | upperIP.4 | downIP.1 | downIP.2 |
 * downIP.3 | downIP.4 | eeyeTCPEvent | hostIP.1 | hostIP.2 | hostIP.3 | hostIP.4 |
 * 0x00 0x00 (check sum 2 bytes) ]
 */
function makeSetSettingMessage(data: tRollerSettings): Uint8Array {
  const version = VERSION;
  const pkglength = PKGLENGTH; //v1 package
  const msg = new Uint8Array(4 + pkglength);
  msg.set([0xb1, version], 0);
  const dv = new DataView(msg.buffer);
  dv.setUint16(2, pkglength, true);
  // msg.set(pkg, 4);
  // Package

  dv.setUint32(4, data.eoz, true);
  dv.setUint32(8, data.pe, true);
  dv.setUint32(12, data.halfSpeed, true);
  dv.setUint32(16, data.speed, true);
  dv.setUint32(20, data.currentSpeed, true);
  dv.setUint32(24, data.jamExprTime, true);
  dv.setUint32(28, data.rumExprTime, true);
  dv.setUint32(32, data.mode, true);
  dv.setUint32(36, data.forceNeighborIP, true);
  const upperIP = ip2array(data.upperIP || "0.0.0.0");
  msg.set(upperIP, 40);
  const lowerIP = ip2array(data.lowerIP || "0.0.0.0");
  msg.set(lowerIP, 44);
  dv.setUint32(48, data.eeyeTCPEvent, true);
  const hostIP = ip2array(data.hostIP || "0.0.0.0");
  msg.set(hostIP, 52);
  const chkPkg = R.slice(4, 52, msg);
  //checkSum
  dv.setUint32(56, chksum(chkPkg), true);

  return msg;
}

function parseSettingMessages(msg: Uint8Array): any {
  const version = VERSION;
  const pkglength = PKGLENGTH; //v1 package
  if (msg[0] !== 0xb0) {
    //GET_SETTINGS
    throw Error("Message Op code is not equal to 0xB0 : ", msg[0]);
  }
  msg.set([0xb1, version], 0);
  const dv = new DataView(msg.buffer);
  if (dv.getUint16(2, true) !== pkglength) {
    throw Error("Package size invalid.");
  }

  let _settings = {};
  // msg.set(pkg, 4);
  // Package
  _settings.eoz = dv.getUint32(4, true);
  _settings.pe = dv.getUint32(8, true);
  _settings.halfSpeed = dv.getUint32(12, true);
  _settings.speed = dv.getUint32(16, true);
  _settings.currentSpeed = dv.getUint32(20, true);
  _settings.jamExprTime = dv.getUint32(24, true);
  _settings.rumExprTime = dv.getUint32(28, true);
  _settings.mode = dv.getUint32(32, true);
  _settings.forceNeighborIP = dv.getUint32(36, true);
  _settings.upperIP = R.compose(
    R.join("."),
    R.slice(40, 44)
  )(msg);
  _settings.lowerIP = R.compose(
    R.join("."),
    R.slice(44, 48)
  )(msg);
  _settings.eeyeTCPEvent = dv.getUint32(48, true);
  _settings.hostIP = R.compose(
    R.join("."),
    R.slice(52, 56)
  )(msg);

  const chkPkg = R.slice(4, 52, msg);
  //checkSum
  const chkSum = dv.getUint32(56, true);
  const calChksum = chksum(chkPkg);
  console.log("chkSum = ", chkSum, " calChkSum = ", calChksum);

  return chkSum === calChksum ? _settings : {};
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
function makeMessage(op: number, data: any): Uint8Array {
  switch (op) {
    case Op.atop_invite:
      return makeAtopInviteMessage();
    case Op.intro:
      return makeIntroMessage();

    case Op.roller:
      return makeRollerMessage(data);

    case Op.config:
      return makeConfigMessage(data);

    case Op.get_settings:
      return makeGetSettingMessage();

    case Op.set_settings:
      return makeSetSettingMessage(data);

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
// For roller package process
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
const getLength = (pkg: Array<number> | Uint8Array): number => pkg[1];

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

/** []Package -> {length, motorID, data, command, rw, commandText, string}
 * @param _pkg : (Array | Uint8Array) roller package
 * @returns {length, motorID, data, command, rw, commandText, string}
 */
const parseRollerPackage = (pkg: Array<number> | Uint8Array) => {
  const isUint8Array = R.is(Uint8Array);
  const _pkg = isUint8Array(pkg) ? Array.from(pkg) : pkg;
  const length = getLength(_pkg);
  const RWField = R.compose(
    splitRWField,
    getRWField
  )(_pkg);
  const motorID = R.prop("motorID")(RWField);
  const rw = R.prop("rw")(RWField);
  const data = getData(_pkg);
  const commandText = getCommandText(_pkg);
  const command = getCommand(_pkg);
  const tostr = v => " 0x" + v.toString(16);
  const string = R.map(tostr)(_pkg);
  const checkSum = _pkg[getLength(_pkg) + 2];
  return { length, motorID, rw, data, commandText, command, string, checkSum };
};

/**
 * MassageParser.isRollerMessage()
 * MessageParser.isJSONMessage()
 * MessageParser.parse()
 */
const MessageParser = {
  isRollerMessage: (msg: Array<number> | Uint8Array) => isRollerMessage(msg),
  isJSONMessage: (msg: Array<number> | Uint8Array) => isJSONMessage(msg),
  parse: (msg: Array<number> | Uint8Array) => {
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
  valid: (msg: Array<number> | Uint8Array) => {
    return isRollerMessage(msg) || isJSONMessage(msg);
  }
};

export {
  Op,
  makeMessage,
  test,
  MessageParser,
  makeRollerPackage,
  parseRollerPackage,
  parseSettingMessages
};
