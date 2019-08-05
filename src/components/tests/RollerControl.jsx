import React from "react";
import { Typography, Row, Col } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
// import Collapse from "components/layout/Collapse";
// import RollerTable from "components/roller/RollerTable";
// import ConnectAlert from "components/roller/ConnectionAlert";
// import RollerSettingDialog from "components/roller/RollerSettingDialog";
import RollerSelector from "components/roller/RollerSelector";
// import isEmpty from "ramda/src/isEmpty";
// import map from "ramda/src/map";

import "App.less";
// import { parseRollerPackage, MessageParser } from "libs/roller";

// import { useTCPSocket } from "libs/tcp/hooks";

const RollerControl = props => {
  // const [destination, setDestination] = useState({});

  // const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);

  // useTCPSocket() response update
  // useEffect(() => {
  //   const resinfo = MessageParser.parse(tcpResponse);
  //   switch (resinfo.type) {
  //     case "roller":
  //       const rollerRes = parseRollerPackage(tcpResponse.slice(4));
  //       console.log("Rev roller res: ", rollerRes);
  //       break;
  //     case "json":
  //       console.log("Rev json res: ", rollerRes);
  //       break;
  //     default:
  //       console.log("Unknown response ");
  //   }
  // }, [tcpResponse]);

  //settings
  // useEffect(() => {
  //   if (!isEmpty(settingRollers)) {
  //     writeBack();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [settingRollers]);

  // const handleConnect = e => {
  //   e.preventDefault();
  //   const data = new Uint8Array(1);
  //   data[0] = 0x01;
  //   const message = makeMessage(Op.roller, {
  //     command: 0x03,
  //     rw: 0x01,
  //     data: data
  //   });
  //   sendData(message);
  // };

  // const handleNetworkingSettingChanged = roller => {
  //   console.log("handleRollerSettingChanged ", roller);
  //   updateRollerByMac(roller);
  // };

  // const handleRollerSettingsChanged = settings => {
  //   try {
  //     const msg = makeMessage(Op.set_settings, JSON.stringify(settings));
  //     console.log("handleRollerSettingsChanged - ", settings, msg);
  //     sendData(msg);
  //   } catch (err) {
  //     console.log("handleRollerSettingsChanged json fiald", settings);
  //   }
  // };

  // const handleRollersTableOnConnect = record => {
  //   setDestination({ ip: record.ip, port: 5566 });
  // };

  // const handleRollersTableOnSetting = record => {
  //   setSelectRoller(record);
  //   setShowSettings(true);
  // };

  // const handleScan = e => {
  //   e.preventDefault();
  //   Scan();
  // };

  // const handleURLChanged = e => {
  //   e.preventDefault();
  //   const v = (e.target && e.target.value) || "";
  //   setUrl(v);
  // };

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <RollerSelector
        currentRollerChanged={r =>
          console.log("RollerControl current roller: ", r)
        }
      />

      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <RollerControlPanel title="Left" />
        </Col>
        <Col span={12}>
          <RollerControlPanel title="Right" />
        </Col>
      </Row>

      {/* <RollerSettingDialog
        visible={showSettings}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
        rollerSettings={selectedRoller}
        onNetworkingChanged={handleNetworkingSettingChanged}
        onRollerSettingsChanged={handleRollerSettingsChanged}
      /> */}
    </div>
  );
};
export default RollerControl;
