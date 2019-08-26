// @flow
import { useState, useEffect } from "react";
import mergeLeft from "ramda/src/mergeLeft";
import has from "ramda/src/has";
import is from "ramda/src/is";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";

import map from "ramda/src/map";
import assoc from "ramda/src/assoc";
import find from "ramda/src/find";
import propEq from "ramda/src/propEq";
import { updateRoller } from "./settingsutils";

const ipc = require("electron").ipcRenderer;

// Roller package hook
// return []

type UseRollerArg = {
  command: Number,
  rw: Number,
  motorID: Number,
  data: Array<number>
};
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
const useRollerPackage = (initOptions: UseRollerArg): Array<mixed> => {
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

  return [settings, handlers];
};

/**
 * @param initSettings: setting with json format
 * @returns [settings, setSettings] : [String, (json: string) => {}]
 */

type SetStateAction<S> = S | ((prevState: S) => S);
type Dispatch<A> = (value: A) => void;
type useRollerSettingsReturn = [
  String,
  { message: String, type: String },
  Dispatch<SetStateAction<String>>
];

/**
 * read/write roller settings
 * const [rollers, updateRollerByMac, writeBack] = useRollers();
 * const newRollers = updateRollerByMac({mac:"00:00:00:11:22:aa", name:"dev1"});
 * writeBack();
 */
const useRollers = (): [Array<any>, Function, Function, Function] => {
  const [rollers, setRollers] = useState([]);

  useEffect(() => {
    ipc.send("getSettings");
    ipc.on("response_settings", function(event, arg) {
      try {
        const parsedRoller = JSON.parse(arg);
        setRollers(parsedRoller);
      } catch (err) {
        setRollers([]);
      }
    });

    return () => {
      ipc.removeAllListeners("response_settings", () => {});
    };
  }, []);

  /**
   * Merge input roller in to rollers or append new roller.
   * @param {} roller - {mac, ...otherOption}
   * const newRollers = updateRollerByMac({mac:"00:00:00:11:22:aa", name:"dev1"});
   *
   */
  const updateRollerByMac = (roller: { mac: string }): Array<any> => {
    const updated = updateRoller(roller, rollers);
    setRollers(updated);
  };

  const writeBack = () => {
    console.log("writeBackwriteBackwriteBackwriteBackwriteBack");

    ipc.send("setSettings", JSON.stringify(rollers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  /**
   * Give scanRollers, and add name prop if name prop be found in settings
   * @param {array of rollers} scanRollers Array of roller got from scan condition
   */
  const assocName = (scanRollers: Array<any>): Array<any> => {
    return map(roller => {
      const matchRoller = find(propEq("mac", roller.mac), rollers);
      if (matchRoller) {
        return assoc("name", matchRoller.name, roller);
      }
      return roller;
    }, scanRollers);

    //return innerJoin((l, r) => l.mac === r.mac, rollers, filterRollers);
  };
  return [rollers, updateRollerByMac, assocName, writeBack];
};

export { useRollerPackage, useRollers };
