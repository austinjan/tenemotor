// @flow
import * as R from "ramda";

type tRoller = { ip: string, mac: string };

//const ipEqual = R.eqProps("ip");
const macEqual = R.eqProps("mac");
//const isSameRoller = R.allPass([ipEqual, macEqual]);
/**
 *
 * @param {{ip: String, mac: String}} roller
 * @param {[roller]} v
 */
function _findIndex(roller: tRoller, rollers: Array<tRoller>): number {
  const matchRoller = R.findIndex(macEqual(roller));
  return matchRoller(rollers);
}
const findRollerIndex = R.curry(_findIndex);

/**
 * @param { {ip: String, mac: String } } roller - roller object
 * @param {[roller]} rollers - array of roller
 *
 */
const isRollerExist = R.curry(
  (roller: tRoller, rollers: Array<tRoller>): boolean =>
    R.any(macEqual(roller))(rollers)
);

/**
 *
 * @param { {ip: String, mac: String } } roller - roller object
 * @param {[roller]} rollers - array of roller
 */
const getRollerName = (roller: tRoller, rollers: Array<tRoller>): string => {
  const index = _findIndex(roller, rollers);
  return index >= 0 ? rollers[index].name : "";
};

/**
 * Change roller's props when roller be found in rollers
 * @param String name
 * @param tRoller roller
 * @param Array<tRoller> rollers
 * @returns Array<tRoller>
 * const newRollers = alterRollerName("roller1",{ip:"192.168.11.200"},rollers)
 */
function alterRollerName(
  name: string,
  roller: tRoller,
  rollers: Array<tRoller>
): Array<tRoller> {
  return R.map(R.when(macEqual(roller), R.assoc("name", name)))(rollers);
}

/**
 * merge roller to rollers when roller.mac is find in rollers
 * @param tRoller newRoller
 * @param tRoller roller
 * @param Array<tRoller> rollers
 */
function mergeRoller(roller: tRoller, rollers: Array<tRoller>): Array<tRoller> {
  return R.map(R.when(macEqual(roller), R.mergeLeft(roller)))(rollers);
}

/**
 * if roller exist then merge it , if not exist then append to end of rollers
 * @param tRoller newRoller
 * @param tRoller roller
 * @param Array<tRoller> rollers
 */
const updateRoller = (
  roller: tRoller,
  rollers: Array<tRoller>
): Array<tRoller> => {
  return isRollerExist(roller, rollers)
    ? mergeRoller(roller, rollers)
    : R.append(roller, rollers);
};

export {
  findRollerIndex,
  alterRollerName,
  isRollerExist,
  mergeRoller,
  updateRoller,
  getRollerName
};
