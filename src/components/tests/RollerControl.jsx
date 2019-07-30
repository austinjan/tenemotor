import React, { useState, useEffect } from "react";
import { Input, Button, Typography, Row, Col } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import Collapse from "components/layout/Collapse";
import RollerTable from "components/roller/RollerTable";
import ConnectAlert from "components/roller/ConnectionAlert";
import RollerSettingDialog from "components/roller/RollerSettingDialog";
import isEmpty from "ramda/src/isEmpty";
import map from "ramda/src/map";

import "App.less";
import {
  makeMessage,
  Op,
  parseRollerPackage,
  MessageParser,
  useRollers
} from "libs/roller";

import { useTCPSocket } from "libs/tcp/hooks";
import { useAtopUDPMonitor } from "libs/udp/hooks";

const RollerControl = props => {
  const [url, setUrl] = useState("192.168.33.222:5566");
  const [destination, setDestination] = useState({});

  // used by RollerSettingDialog
  const [selectedRoller, setSelectRoller] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  const [rollers, Scan] = useAtopUDPMonitor(55954);
  const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);
  const [
    settingRollers,
    updateRollerByMac,
    interSection,
    writeBack
  ] = useRollers();

  // useTCPSocket() response update
  useEffect(() => {
    const resinfo = MessageParser.parse(tcpResponse);
    switch (resinfo.type) {
      case "roller":
        const rollerRes = parseRollerPackage(tcpResponse.slice(4));
        console.log("Rev roller res: ", rollerRes);
        break;
      case "json":
        console.log("Rev json res: ", rollerRes);
        break;
      default:
        console.log("Unknown response ");
    }
  }, [tcpResponse]);

  // rollers
  useEffect(() => {
    map(r => {
      updateRollerByMac(r);
    }, rollers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollers]);

  //settings
  useEffect(() => {
    if (!isEmpty(settingRollers)) {
      writeBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingRollers]);

  const handleConnect = e => {
    e.preventDefault();
    const data = new Uint8Array(1);
    data[0] = 0x01;
    const message = makeMessage(Op.roller, {
      command: 0x03,
      rw: 0x01,
      data: data
    });
    sendData(message);
  };

  const handleNetworkingSettingChanged = roller => {
    console.log("handleRollerSettingChanged ", roller);
    updateRollerByMac(roller);
  };

  const handleRollerSettingsChanged = settings => {
    try {
      const msg = makeMessage(Op.set_settings, JSON.stringify(settings));
      console.log("handleRollerSettingsChanged - ", settings, msg);
      sendData(msg);
    } catch (err) {
      console.log("handleRollerSettingsChanged json fiald", settings);
    }
  };

  const handleRollersTableOnConnect = record => {
    setDestination({ ip: record.ip, port: 5566 });
  };

  const handleRollersTableOnSetting = record => {
    setSelectRoller(record);
    setShowSettings(true);
  };

  const handleScan = e => {
    e.preventDefault();
    Scan();
  };

  const handleURLChanged = e => {
    e.preventDefault();
    const v = (e.target && e.target.value) || "";
    setUrl(v);
  };

  const handleSettingsOk = () => {
    setShowSettings(false);
  };

  const handleSettingsCancel = () => {
    setShowSettings(false);
  };

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <Row gutter={16}>
        <Col span={10} style={{ display: "flex" }}>
          <Input placeholder="url:" value={url} onChange={handleURLChanged} />
        </Col>

        <Col span={5}>
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            onClick={handleConnect}
          >
            Connect
          </Button>
        </Col>
        <Col span={5}>
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            onClick={handleScan}
          >
            Scan
          </Button>
        </Col>
      </Row>
      <Row className="ui__row">
        <Col span={24}>
          <ConnectAlert {...currentStatus} />
        </Col>
      </Row>
      <Row className="ui_row">
        <Col span={24}>
          <Collapse collapse={rollers.length === 0}>
            <RollerTable
              rollers={interSection(rollers)}
              onConnect={handleRollersTableOnConnect}
              onSetting={handleRollersTableOnSetting}
            />
          </Collapse>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <RollerControlPanel title="Left" />
        </Col>
        <Col span={12}>
          <RollerControlPanel title="Right" />
        </Col>
      </Row>

      <RollerSettingDialog
        visible={showSettings}
        onOk={handleSettingsOk}
        onCancel={handleSettingsCancel}
        rollerSettings={selectedRoller}
        onNetworkingChanged={handleNetworkingSettingChanged}
        onRollerSettingsChanged={handleRollerSettingsChanged}
      />
    </div>
  );
};
export default RollerControl;
