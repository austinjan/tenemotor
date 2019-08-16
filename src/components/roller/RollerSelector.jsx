// @flow
import React, { useState, useReducer } from "react";
import RollerTable from "./RollerTable";
import RollerInformation from "./RollerInformation";
import RollerSelectBar from "./RollerSelectBar";
import RollerSettingDialog from "components/roller/RollerSettingDialog";
import type { tRoller } from "libs/roller/rollerType";
import { fetchSettings, sendTo } from "libs/tcp";
import { fetchRollers } from "libs/udp";
import { useRollers, makeMessage, Op, parseSettingMessages } from "libs/roller";
import { useAlert } from "components/utils";
// $FlowFixMe
import "./RollerSelector.less";

type tProps = {
  currentRollerChanged: (newRoller: tRoller) => {}
};

function rollerReducer(rollers, action) {
  switch (action.type) {
    case "INVITE":
      const roller = action.payload;
      const index = rollers.findIndex(item => {
        return item.mac === roller.mac;
      });
      if (rollers[index] === roller) return rollers;
      if (index >= 0) {
        rollers.splice(index, 1, roller);
      } else {
        rollers.push(roller);
      }
      return [...rollers];
    default:
      return rollers;
  }
}

const RollerSelector = (props: tProps) => {
  const { currentRollerChanged } = props;

  const [showTable, setShowTable] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentRoller, setCurrentRoller] = useState({});
  const [MyAlert, displayInfo, displayError, hideAlert] = useAlert();
  const [helpText, setHelpText] = useState(
    "Press search button to scan rollers.."
  );
  const [rollers, dispatchRollers] = useReducer(rollerReducer, []);
  const [
    settingRollers,
    updateRollerByMac,
    interSection,
    writeBack
  ] = useRollers();

  const handleScan = () => {
    console.log("handleScan");
    displayInfo("Scanning.....");
    fetchRollers()
      .then(data => {
        console.log("fetchRoller -> ", data);
        if (Array.isArray(data)) {
          data.map(roller => {
            roller.key = roller.mac;
            updateRollerByMac(roller);
            dispatchRollers({ type: "INVITE", payload: roller });
          });
          if (data.length > 0) {
            setShowTable(true);
            setHelpText("Select roller...");
            hideAlert();
          } else {
            displayError("No roller found..");
          }
        } else {
          data.key = data.mac;
          updateRollerByMac(data);
          dispatchRollers({ type: "INVITE", payload: data });
          setShowTable(true);
          setHelpText("Select roller...");
          hideAlert();
        }
      })
      .catch(err => {
        console.log("fetchRollers error : ", err);
        displayError(err);
      });
  };

  const handleCurrentRollerChanged = (roller: any) => {
    console.log("handleCurrentRollerChanged ", roller);
    setCurrentRoller(roller);
    currentRollerChanged(roller);
    fetchSettings(roller.ip).then(data => {
      const settings = parseSettingMessages(data);
      console.log("fetch settings: ", data, settings);
      setCurrentRoller(pre => ({ ...pre, rollerSettings: settings }));
    });
  };

  const handleToggleTable = () => {
    setShowTable(!showTable);
  };

  const handleToggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const handleSetting = () => {
    setShowSettings(true);
  };

  const handleSettingsOk = () => {
    setShowSettings(false);
  };

  const handleNetworkingSettingChanged = roller => {
    console.log("handleRollerSettingChanged ", roller);
    updateRollerByMac(roller);
    writeBack();
  };

  const handleRollerSettingsChanged = settings => {
    console.log("handleRollerSettingsChanged ", settings, currentRoller);
    const msg = makeMessage(Op.set_settings, settings);
    if (currentRoller.ip) {
      sendTo(currentRoller.ip, msg)
        .then(data => console.log("TCP response ", data))
        .catch(err => console.log("Fetch Settings error: ", err));
    } else {
    }
  };

  const handleSettingsCancel = () => {
    setShowSettings(false);
  };

  const Table = showTable ? (
    <RollerTable
      onConnect={handleCurrentRollerChanged}
      rollers={interSection(rollers)}
    />
  ) : null;

  return (
    <div>
      <RollerSelectBar
        showTable={showTable}
        onScan={handleScan}
        onSetting={handleSetting}
        toggleShowTable={handleToggleTable}
        toggleInfo={handleToggleInfo}
        helpText={helpText}
        {...currentRoller}
      />
      {MyAlert}
      {showInfo ? <RollerInformation {...currentRoller} /> : null}
      {Table}

      <RollerSettingDialog
        visible={showSettings}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
        rollerSettings={currentRoller}
        onNetworkingChanged={handleNetworkingSettingChanged}
        onRollerSettingsChanged={handleRollerSettingsChanged}
      />
    </div>
  );
};
export default RollerSelector;
