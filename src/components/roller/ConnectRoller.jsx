// @flow
import React from "react";
import { Button } from "antd";

import map from "ramda/src/map";
import isEmpty from "ramda/src/isEmpty";

/**
 * This component provide convinient way to connect roller control card.
 * props:
 * onConnect({ip, port}) -> connect to specific socket.
 * rollers -> [{ip,mac,...}] array of rollers (you can get from useAtopUDPMonitor())
 */

type Props = {
  onConnect: Function,
  rollers: [{ ip: String, mac: String }]
};

const ConnectRoller = (props: Props) => {
  const { onConnect, rollers } = props;

  const children = isEmpty(rollers) ? (
    <span> Roller not found! </span>
  ) : (
    map(
      roller => (
        <Button
          key={roller.mac}
          onClick={() => onConnect(roller)}
          className="ui__row-item"
        >
          Connect to {roller.ip}{" "}
        </Button>
      ),
      rollers
    )
  );

  return <div className="ui__row"> {children} </div>;
};

export default ConnectRoller;
