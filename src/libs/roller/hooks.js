// @flow
import { useState, useEffect } from "react";
import mergeLeft from "ramda/src/mergeLeft";
import has from "ramda/src/has";
import is from "ramda/src/is";
import { convertStringToByteArray } from "libs/udp/BinaryUtils";
import equals from "ramda/src/equals";
import props from "ramda/src/props";
import reduce from "ramda/src/reduce";
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

const useRollerSettings = (initSettings: ?String): useRollerSettingsReturn => {
  const [jsonSettings, setJsonSettings] = useState(initSettings);
  const [responseState, setResponseState] = useState({
    message: "",
    type: "info"
  });

  useEffect(() => {
    ipc.send("getSettings");
    setResponseState({ type: "info", message: "Loading roller settings." });
    return () => {
      ipc.removeAllListeners("response_settings", () => {});
      ipc.removeAllListeners("settings_err", () => {});
      ipc.removeAllListeners("set_settings_done", () => {});
    };
  }, []);

  ipc.on("response_settings", function(event, arg) {
    if (!equals(arg, jsonSettings)) {
      setJsonSettings(arg);
      setResponseState({ type: "info", message: "Loading done..." });
    }
  });

  ipc.on("settings_err", function(event, arg) {
    const errArguments = props(["code", "path"], arg);
    const msg = is(String, arg)
      ? arg
      : reduce((acc, elem) => acc + " " + elem, "", errArguments);

    setResponseState({ type: "error", message: msg });
  });

  ipc.on("set_settings_done", (event, arg) => {
    setResponseState({ type: "info", message: "Writting done..." });
  });

  const writeSettings = (settings: string) => {
    ipc.on("setSettings", (settings = "{}"));
    setResponseState({ type: "info", message: "Writting..." });
  };

  return [jsonSettings, responseState, writeSettings];
};

export { useRollerPackage, useRollerSettings };
