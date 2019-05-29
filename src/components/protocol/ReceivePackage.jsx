import React, { useEffect, useRef, useState } from "react";
import { Switch } from "antd";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

// Component start here!
export default props => {
  const { port } = props;
  const [listen, setListen] = useState(false);

  const server = useRef(null);
  useEffect(() => {
    // server.current = dgram.createSocket({ type: "udp4", reuseAddr: true });
    // server.current.on("listening", () => {
    //   const address = server.current.address();
    //   console.log(`server listening ${address.address}:${address.port}`);
    // });
    // server.current.on("error", err => {
    //   console.log(`server error:\n${err.stack}`);
    //   server.current.close();
    // });

    // server.current.on("message", (msg, rinfo) => {
    //   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // });

    //server.current.bind(props.port || 5566);

    return function cleanup() {
      // server.current && server.current.close();
    };
  }, []);

  const handleListenChanged = checked => {
    setListen(checked);
    if (checked) {
      server.current && server.current.bind(port);
    } else {
      server.current && server.current.close();
    }
  };

  return (
    <div>
      <div className="ui_row">
        <Switch
          checkedChildren="On"
          unCheckedChildren="Off"
          defaultChecked={listen}
          onChange={handleListenChanged}
        />
      </div>
    </div>
  );
};
