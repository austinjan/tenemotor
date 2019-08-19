// @flow
import React, { useState } from "react";
import { Typography, Row, Col, Alert } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import RollerSelector from "components/roller/RollerSelector";
import has from "ramda/src/has";
// $FlowFixMe
import "App.less";

const RollerControl = () => {
  const [currentRoller, setCurrentRoller] = useState({});
  const [errorState, setError] = useState({ msg: "", diaplay: false });
  const handleCurrentRollerChanged = (newRoller: { ip: string }) => {
    console.log("new roller : ", newRoller);

    has("ip", newRoller)
      ? setCurrentRoller(newRoller)
      : setError({ msg: "Roller missing ip address.", display: true });
  };

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      {errorState.display ? <Alert /> : null}
      <RollerSelector currentRollerChanged={handleCurrentRollerChanged} />

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
