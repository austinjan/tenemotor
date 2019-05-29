import React from "react";
import "App.less";
import {
  Typography,
  Statistic,
  Switch,
  InputNumber,
  Card,
  Divider
} from "antd";

export default props => {
  const { title } = props;
  return (
    <div>
      <Card title={title}>
        <Typography.Title level={3}>Status</Typography.Title>
        <Statistic title="Phase Current" value={12} suffix="mA" />
        <Statistic title="Motor Period" value={9332} suffix="rpm" />
        <Statistic
          title="Card Temperature"
          value={55.67}
          suffix={<span>&deg;C</span>}
        />
        <Statistic title="Fuzzy MEMF" value={223} suffix="?" />
        <Statistic title="Motor Speed" value={556} suffix="rpm" />

        <Divider />
        <div>
          <Typography.Title level={3}>Control</Typography.Title>
          <div className="ui__row">
            <span className="ui__row-item">Motor ON/OFF: </span>
            <Switch
              className="ui__row-item"
              checkedChildren="ON"
              unCheckedChildren="OFF"
              defaultChecked={false}
            />
          </div>
          <div className="ui__row">
            <span className="ui__row-item">Motor speed: </span>
            <InputNumber defaultValue={100} className="ui__row-item" />
          </div>
        </div>
      </Card>
    </div>
  );
};
