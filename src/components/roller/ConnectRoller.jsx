import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";

import map from "ramda/src/map";
import isEmpty from "ramda/src/isEmpty";

/**
 * This component provide convinient way to connect roller control card.
 * props:
 * onConnect({ip, port}) -> connect to specific socket.
 * rollers -> [{ip,mac,...}] array of rollers (you can get from useAtopUDPMonitor())
 */

const ConnectRoller = props => {
  const { onConnect, rollers } = props;
  // const handleConnect = e => {
  //   setLoading(true);
  //   console.log("handleConnect ", rollers);
  //   const isArray = is(Array);
  //   if (isArray(rollers)) {
  //     if (rollers.length === 1) {
  //       setTcpSettings(head(rollers));
  //     }
  //   }
  //   setLoading(false);
  //   e.preventDefault();
  // };

  const children = isEmpty(rollers) ? (
    <span>Roller not found!</span>
  ) : (
    map(
      roller => (
        <Button
          key={roller.mac}
          onClick={() => onConnect(roller)}
          className="ui__row-item"
        >
          Connect to {roller.ip}
        </Button>
      ),
      rollers
    )
  );

  return <div className="ui__row">{children}</div>;
};

ConnectRoller.propTypes = {
  onConnect: PropTypes.func,
  rollers: PropTypes.array
};

ConnectRoller.defaultProps = {
  onConnect: () => {},
  rollers: []
};

export default ConnectRoller;
