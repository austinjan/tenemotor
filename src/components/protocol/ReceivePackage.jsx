import React, { useEffect, useState, useRef } from "react";
import { Switch } from "antd";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

// Component start here!
export default props => {
  const { port } = props;
  const [listen, setListen] = useState(false);

  // const socket = useRef();
  let server = dgram.createSocket({ type: "udp4", reuseAddr: true });
  useEffect(() => {
    console.log("receivepackage: init");

    server.on("listening", () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.on("message", (msg, rinfo) => {
      let buffer = Uint8Array.from(msg);

      let op = String.fromCharCode(...buffer.subarray(0, 2));

      let length = buffer[2];
      if (op === "JS") {
        let json = String.fromCharCode(...buffer.subarray(4, length + 4));
        let response = JSON.parse(json);
        console.log("res: ", response);
      } else {
        console.log("unknow response...");
      }
    });

    server.on("error", err => {
      console.log(`server error ${err}`);
    });

    server.bind(port);

    return () => {
      console.log("ReceivePackage close socket");
      server.close();
    };
  }, [port, server]);

  return (
    <div>
      <p>Here</p>
      <div className="ui_row" />
    </div>
  );
};
