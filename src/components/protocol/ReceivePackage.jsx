import React, { useEffect, useState } from "react";
import { getUdpObservable, jsonResponse } from "libs/udp/udputils";
import { Table } from "antd";
const shortid = require("shortid");

// Component start here!
export default props => {
  const { port } = props;

  const [devices, setDevices] = useState([]);

  let jsonObserver = {
    next: v => {
      try {
        let item = { ...v, key: shortid.generate() };
        setDevices(pre => [...pre, item]);
      } catch (err) {
        console.log("observer err:", err);
      }
    },
    error: err => {
      console.log("observer error: ", err);
    },
    done: () => {
      console.log("udp observable complete!");
    }
  };

  // const socket = useRef();
  //let server = dgram.createSocket({ type: "udp4", reuseAddr: true });
  useEffect(() => {
    const udpListener$ = getUdpObservable(port);
    const jsonResponse$ = jsonResponse(udpListener$);

    const subscription = jsonResponse$.subscribe(jsonObserver);

    return () => {
      console.log("ReceivePackage close socket");
      //server.close();
      subscription.unsubscribe();
    };
  }, [jsonObserver, port]);

  const rowSelectionOpt = {
    type: "radio",
    onChange: (key, rows) => {
      console.log(key, rows);
    }
  };
  return (
    <div>
      <Table
        rowSelection={rowSelectionOpt}
        dataSource={devices}
        columns={[
          { title: "Device", dataIndex: "devname", key: "devname" },
          { title: "From", dataIndex: "ip", key: "ip" }
        ]}
      />
    </div>
  );
};
