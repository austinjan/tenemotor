// @flow
import React, { useState, useEffect } from "react";
import { Button, Badge } from "antd";
import has from "ramda/src/has";

const PollingControlBar = (props: {
  roller: { ip: string, port: string | number },
  connecting: boolean,
  onConnect: Function,
  onDisconnect: Function
}) => {
  const { roller, onConnect, onDisconnect, connecting } = props;
  const [validRoller, setValidRoller] = useState(false);
  useEffect(() => {
    setValidRoller(has("ip", roller));
  }, [roller]);

  return (
    <div className="ui__row">
      <Button.Group>
        <Button
          disabled={!validRoller}
          type="primary"
          onClick={() => {
            onConnect(roller.ip, roller.port);
          }}
        >
          Polling
        </Button>
        <Button
          type="primary"
          disabled={!validRoller}
          onClick={() => {
            onDisconnect();
          }}
        >
          Stop
        </Button>
      </Button.Group>
      <Badge
        status={connecting ? "success" : "error"}
        text={connecting ? "polling" : "stop"}
      />
    </div>
  );
};

PollingControlBar.defaultProps = {
  roller: {
    ip: "",
    port: 5566
  },
  onConnect: () => {},
  onDisconnect: () => {},
  connecting: false
};

export default PollingControlBar;
