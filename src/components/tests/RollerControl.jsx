// @flow
import React, { useState, useContext } from "react";
import { Typography, Row, Col } from "antd";
import PollingControlBar from "components/protocol/PollingControlBar";
import RollerInformationPanel from "./RollerInformationPanel";
import RollerSelector from "components/roller/RollerSelector";
import { usePolling } from "libs/tcp/hooks";
import { AlertContext } from "components/alertutils";
import { makeMessage, Op } from "libs/roller";
import has from "ramda/src/has";
// $FlowFixMe
import "App.less";

const REACT_VERSION = React.version;
console.log("REACT_VERSION ", REACT_VERSION);

const pollingMessages = [
  makeMessage(Op.roller, { command: 0x01, rw: 0x01, data: [], motorID: 0 }), //Phase Current
  makeMessage(Op.roller, { command: 0x01, rw: 0x01, data: [], motorID: 1 }) //Phase Current id=1
];

const RollerControl = () => {
  const [currentRoller, setCurrentRoller] = useState({});

  const alert = useContext(AlertContext);

  const onRollerResponse = res => {};
  const [startPolling, stopPolling, isPolling] = usePolling(
    {
      ...currentRoller,
      onData: data => onRollerResponse,
      onError: err => console.log("err ", err),
      interval: 1000
    },
    pollingMessages
  );

  const handleCurrentRollerChanged = newRoller => {
    has("ip", newRoller)
      ? setCurrentRoller(newRoller)
      : alert.error("Invalid IP!");
  };

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <RollerSelector currentRollerChanged={handleCurrentRollerChanged} />
      <PollingControlBar
        roller={currentRoller}
        onConnect={startPolling}
        connecting={isPolling}
        onDisconnect={stopPolling}
      />
      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <RollerInformationPanel title="Upper" />
        </Col>
        <Col span={12}>
          <RollerInformationPanel title="Lower" />
        </Col>
      </Row>
    </div>
  );
};
export default RollerControl;
