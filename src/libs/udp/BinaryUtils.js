// Library for binary
// num to string, string to Uint8Array...
import is from "ramda/src/is";
import complement from "ramda/src/complement";

const getHexString = (num, prefix = "") => {
  const isNotNumber = complement(is(Number));
  if (isNotNumber(num)) return "";
  let rawStr = num.toString(16);
  if (rawStr.length % 2) {
    return prefix + "0" + rawStr;
  } else {
    return prefix + rawStr;
  }
};

// num
const getDWHexString = (num, prefix = "") => {
  let rawStr = typeof num === "number" ? num.toString(16) : num;
  let fillZero = 8 - rawStr.length;
  if (fillZero) {
    rawStr = "0".repeat(fillZero) + rawStr;
  }
  rawStr = rawStr.slice(-8);
  let splitByteArray = [];
  for (let i = 0; i < 4; i++) {
    splitByteArray.push(prefix + rawStr.substr(-2 * (i + 1), 2));
  }

  return splitByteArray.join(" ");
};

// convert HEX string to Uint8Array
// "7fab1122" -> UInt8Array[22,11,ab,7f]
const convertStringToByteArray = data => {
  const digit = Math.ceil(data.length);
  const buff = new ArrayBuffer(digit / 2);
  const arr = new Uint8Array(buff);
  let i;
  let cursor = data.length;
  for (i = 0; i < digit / 2; i++) {
    arr[i] = parseInt(data.slice(cursor - 2, cursor), 16);
    cursor -= 2;
  }
  return arr;
};

export { convertStringToByteArray, getDWHexString, getHexString };
