// @flow
import React, { useState } from "react";
// $FlowFixMe
import "App.less";
import {
  Typography,
  Statistic,
  Switch,
  InputNumber,
  Card,
  Divider,
  Button
} from "antd";

type Props = {
  title: string
  // phaseCurrent: string | number,
  // motorPeriod: string | number,
  // cardTemperature: string | number,
  // fuzzy: string | number,
  // motorSpeed: string | number,
  // motorOnOff: string | number,
  // motorSpeedExpect: string | number,
  // onOnOffChanged: (v: boolean) => void,
  // onMotorSpeedChanged: (v: number | string) => void
};
const RollerInformationPanel = props => {
  const { title } = props;
  const {
    phaseCurrent,
    motorPeriod,
    cardTemperature,
    fuzzy,
    motorSpeed,
    motorOnOff,
    motorSpeedExpect
  } = props;
  const { onOnOffChanged, onMotorSpeedChanged } = props;
  const [speed, setSpeed] = useState(motorSpeedExpect);

  return (
    <div>
      <Card title={title}>
        <Typography.Title level={3}>Status</Typography.Title>
        <Statistic title="Phase Current" value={phaseCurrent} suffix="mA" />
        <Statistic title="Motor Period" value={motorPeriod} suffix="rpm" />
        <Statistic
          title="Card Temperature"
          value={cardTemperature}
          suffix={<span>&deg;C</span>}
        />
        <Statistic title="Fuzzy MEMF" value={fuzzy} suffix="?" />
        <Statistic title="Motor Speed" value={motorSpeed} suffix="rpm" />

        <Divider />
        <div>
          <Typography.Title level={3}>Control</Typography.Title>
          <div className="ui__row">
            <span className="ui__row-item">Motor ON/OFF: </span>
            <Switch
              className="ui__row-item"
              checkedChildren="ON"
              unCheckedChildren="OFF"
              defaultChecked={motorOnOff}
              onChange={onOnOffChanged}
            />
          </div>
          <div className="ui__row">
            <span className="ui__row-item">Motor speed: </span>
            <InputNumber
              defaultValue={motorSpeedExpect}
              className="ui__row-item"
              onChange={v => setSpeed(v)}
            />
            <Button
              type="primary"
              onClick={() => {
                onMotorSpeedChanged(speed);
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

RollerInformationPanel.defaultProps = {
  phaseCurrent: 12,
  motorPeriod: 9332,
  cardTemperature: 55.42,
  fuzzy: 223,
  motorSpeed: 556,
  motorOnOff: false,
  motorSpeedExpect: 100,
  onOnOffChanged: v => {
    console.log(v);
  },
  onMotorSpeedChanged: v => {
    console.log(v);
  }
};

export default React.memo<Props>(RollerInformationPanel);
