// @flow
import React from "react";
import type { Node } from "react";
import { Descriptions, Empty } from "antd";

import type { tRoller } from "libs/roller/rollerType";

const RollerInformaion = (props: tRoller): Node => {
  const { rollerSettings } = props;

  return (
    <div>
      {props === undefined ? (
        <Empty />
      ) : (
        <Descriptions
          title="Networking arguments"
          bordered
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label="Name">{props.name}</Descriptions.Item>
          <Descriptions.Item label="IP">{props.ip}</Descriptions.Item>
          <Descriptions.Item label="MAC">{props.mac}</Descriptions.Item>
          <Descriptions.Item label="Subnet">{props.subnet}</Descriptions.Item>
          <Descriptions.Item label="Gateway">{props.gateway}</Descriptions.Item>
        </Descriptions>
      )}

      {rollerSettings === undefined ? (
        <Empty />
      ) : (
        <Descriptions
          title="Roller arguments"
          bordered
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label="Upper roller IP">
            {rollerSettings.upperIP}
          </Descriptions.Item>
          <Descriptions.Item label="Lower roller IP">
            {rollerSettings.lowerIP}
          </Descriptions.Item>
          <Descriptions.Item label="End of Zone">
            {rollerSettings.eoz}
          </Descriptions.Item>
          <Descriptions.Item label="Photo eye">
            {rollerSettings.pe}
          </Descriptions.Item>
          <Descriptions.Item label="Half speed">
            {rollerSettings.halfSpeed}
          </Descriptions.Item>
          <Descriptions.Item label="Char speed">
            {rollerSettings.speed}
          </Descriptions.Item>
          <Descriptions.Item label="Char current speed">
            {rollerSettings.currentSpeed}
          </Descriptions.Item>
          <Descriptions.Item label="JAM timer expiration time">
            {rollerSettings.jamExprTime}
          </Descriptions.Item>
          <Descriptions.Item label="Run timer expiration time">
            {rollerSettings.rumExprTime}
          </Descriptions.Item>
          <Descriptions.Item label="Mode">
            {rollerSettings.mode}
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
};

export default RollerInformaion;
