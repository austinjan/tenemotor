// @flow
import React, { useState, useContext } from "react";
import { Typography, Row, Col } from "antd";
import PollingControlBar from "components/protocol/PollingControlBar";
import RollerControlPanel from "./RollerCongrolPanel";
import RollerSelector from "components/roller/RollerSelector";
import { useTCPSocket } from "libs/tcp/hooks";
import { AlertContext } from "components/alertutils";
import has from "ramda/src/has";
// $FlowFixMe
import "App.less";

const RollerControl = () => {
  const [currentRoller, setCurrentRoller] = useState({});

  const alert = useContext(AlertContext);
  const { api, connecting } = useTCPSocket({
    onData: data => console.log(data),
    onError: err => console.log(err)
  });

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
        onConnect={api.connect}
        connecting={connecting}
        onDisconnect={api.disconnect}
      />
      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <RollerControlPanel title="Upper" />
        </Col>
        <Col span={12}>
          <RollerControlPanel title="Lower" />
        </Col>
      </Row>
    </div>
  );
};
export default RollerControl;
