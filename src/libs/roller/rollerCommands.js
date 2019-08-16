// @flow

import type { tRollerPackageArg } from "./rollerType";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";
import * as R from "ramda";

const ReadCommand = {
  phaseCurrent: 0x01,
  mortorPeriod: 0x02,
  cardTemperature: 0x03,
  fuzzy: 0x04,
  gpioStatus: 0x05,
  params: 0x06,
  motorSpeed: 0x08,
  uartHall: 0x09
};

const WriteCommand = {
  motorSpeed: 0x08
};

const indexReduce = R.addIndex(R.reduce(R.__, 0));

const array2Num = indexReduce((acc, v, idx) => {
  return acc | (v << (idx * 8));
});

/**
 * [0,1] => 256
 * @param {Array | Uint8Array} buffer
 */
const bigEndian2Number = buffer => {
  try {
    return array2Num(buffer);
  } catch (err) {
    console.log("bigEndian2Number err ", err, buffer);
    return 0;
  }
};

/**
 * {command,rw,data,motoID} -> [Package]
 * @description Make package will send to Tene roller control card.
 * @param {object} settings {command:byte, rw: 0x00|0x01, data: Uint8Array, motorID}

 * @returns roller package array
 */
function makeRollerPackage(settings: tRollerPackageArg | {}) {
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

export { makeRollerPackage, ReadCommand, WriteCommand };
