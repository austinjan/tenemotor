import { useState } from "react";
import mergeLeft from "ramda/src/mergeLeft";
import mergeRight from "ramda/src/mergeRight";
import has from "ramda/src/has";
import forEachObjectIndex from "ramda/src/forEachObjIndexed";
import is from "ramda/src/is";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";

// Roller package hook
// return []

// <RollerPackage {...handlers } />
/**
 *
 * @param {*} initOptions pass initial value
 *
 * You can modify options in roller package use handlers
 *  If you want to inject handler to react component:
 *  const [handler] = useRollerPackage({});
 *  <ComponentCarePackage {...handler} />
 */
const useRollerPackage = initOptions => {
  const _init = mergeLeft(initOptions, {
    command: 0x00,
    rw: 0x00,
    motorID: 0x00,
    data: []
  });
  // const [command, setCommand] = useState(_init.command);
  // const [rw, setRW] = useState(_init.tw);
  // const [motorID, setMotorID] = useState(_init.motorID);
  // const [data, setData] = useState(_init.data);
  const [settings, setSettings] = useState(_init);

  const handleData = v => {
    const isString = is(String);
    const _v = has("target", v) ? v.target.value : v;
    const _data = isString(_v) ? convertStringToByteArray(_v) : _v;
    setSettings({ ...settings, data: _data });
    // const _s = mergeRight(settings,);
    // settings(_data);
  };

  const handlers = {
    handleCommandChanged: v => setSettings({ ...settings, command: v }),
    handleRWChanged: v => setSettings({ ...settings, rw: v }),
    handleDataChanged: handleData,
    handleMotorIDChanged: v => setSettings({ ...settings, motorID: v })
  };

  // function setRollerOpt(opt) {
  //   const settingFunctions = {
  //     command: setCommand,
  //     rw: setRW,
  //     motorID: setMotorID,
  //     data: setData
  //   };
  //   const setArgs = forEachObjectIndex((v, k) => {
  //     if (has(k, settingFunctions)) {
  //       settingFunctions[k](v);
  //     }
  //   });
  //   setArgs(opt);
  // }

  return [settings, handlers];
};

export { useRollerPackage };
