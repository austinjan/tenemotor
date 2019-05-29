import React, { useState } from "react";
import { Input, Button, Typography, Row, Col } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import "App.less";
const RollerControl = props => {
  const handleConnect = e => {
    e.preventDefault();
    setLoading(true);
  };
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <Row gutter={16}>
        <Col span={24} style={{ display: "flex" }}>
          <Input placeholder="Input IP address" />
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            loading={loading}
            onClick={handleConnect}
          >
            Connect
          </Button>
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
    </div>
  );
};
export default RollerControl;
