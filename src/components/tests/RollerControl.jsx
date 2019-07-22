import React, { useState, useReducer, useEffect, useRef } from "react";
import { Input, Button, Typography, Row, Col } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import Collapse from "components/layout/Collapse";
import RollerTable from "components/roller/RollerTable";
import ConnectAlert from "components/roller/ConnectionAlert";
import NetworkingSettings from "components/roller/NetworkingSettings";

import "App.less";
import { makeMessage, Op, parseRollerPackage } from "libs/roller/rollerutils";

import { useTCPSocket } from "libs/tcp/hooks";
import { useAtopUDPMonitor } from "libs/udp/hooks";

const RollerControl = props => {
  const [url, setUrl] = useState("192.168.33.222:5566");
  const [destination, setDestination] = useState({});

  // used by NetworkingSettings
  const [selectedRoller, setSelectRoller] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const networkingSettingformRef = useRef(null);

  const [rollers, Scan] = useAtopUDPMonitor(55954);
  const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);

  // useTCPSocket() response update
  useEffect(() => {
    const rollerRes = parseRollerPackage(tcpResponse);
    console.log("Rev roller res: ", rollerRes);
  }, [tcpResponse]);

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

  const handleRollersTableOnConnect = record => {
    console.log("handleRollersTableOnConnect ", record);
    setDestination({ ip: record.ip, port: 5566 });
    //ipc.send("tcp-connect", record);
  };

  const handleRollersTableOnSetting = record => {
    console.log("handleRollersTableOnSetting ", record);
    setSelectRoller(record);
    setShowSettings(true);
    //setDestination({ ip: record.ip, port: 5566 });
    //ipc.send("tcp-connect", record);
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

  const handleNetworkSettingOk = () => {
    setShowSettings(false);
  };

  const handleNetworkSettingCancel = () => {
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
              rollers={rollers}
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

      <NetworkingSettings
        visible={showSettings}
        wrappedComponentRef={form => {
          networkingSettingformRef.current = form;
        }}
        onOk={handleNetworkSettingOk}
        onCancel={handleNetworkSettingCancel}
        rollerSettings={selectedRoller}
      />
    </div>
  );
};
export default RollerControl;
