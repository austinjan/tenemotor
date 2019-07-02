import React, { useState, useReducer, useEffect } from "react";
import { Input, Button, Typography, Row, Col } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import Collapse from "components/layout/Collapse";
import RollerTable from "components/roller/RollerTable";
import ConnectAlert from "components/tests/ConnectionAlert";

import "App.less";
import { makeMessage, Op, RollerParser } from "libs/roller/rollerutils";

import { useTCPSocket } from "libs/tcp/hooks";
import { useUDPLitsener } from "libs/udp/hooks";

const ipc = require("electron").ipcRenderer;

// const broadcastAddress = require("electron").remote.require(
//   "broadcast-address"
// );

function rollerReducer(rollers, action) {
  switch (action.type) {
    case "INVITE":
      const roller = action.payload;
      const index = rollers.findIndex(item => {
        return item.mac === roller.mac;
      });
      if (rollers[index] === roller) return rollers;
      if (index >= 0) {
        rollers.splice(index, 1, roller);
      } else {
        rollers.push(roller);
      }
      return [...rollers];
    default:
      return rollers;
  }
}

const RollerControl = props => {
  //const [connectStatus, setConnectStatus] = useState(status.notConnected);
  const [url, setUrl] = useState("192.168.33.222:5566");
  const [destination, setDestination] = useState({});
  const [rollers, dispatchRollers] = useReducer(rollerReducer, []);

  const response = useUDPLitsener(55954);
  const [currentStatus, receiveTarget, sendData] = useTCPSocket(destination);

  useEffect(() => {
    const real_response = response.response || response;
    if (!RollerParser.valid(real_response)) return;

    const msg = RollerParser.parse(real_response);

    switch (msg.type) {
      case "json":
        console.log("json ", msg.message);
        const resItem = JSON.parse(msg.message);
        if ("mac" in resItem) {
          resItem.key = resItem.mac;
          dispatchRollers({ type: "INVITE", payload: resItem });
        }

        break;
      case "roller":
        console.log("roller ", msg.message);
        break;
      default:
        console.log("response is undefined ", msg.message);
        break;
    }
  }, [response]);

  const handleConnect = e => {
    e.preventDefault();
    const data = new Uint8Array(1);
    data[0] = 0x01;
    const message = makeMessage(Op.roller, {
      command: 0x03,
      rw: 0x01,
      data: data
    });
    sendData(message);
  };

  const handleRollersTableRowClick = record => {
    console.log("handleRollersTableRowClick ", record);
    setDestination({ ip: record.ip, port: 5566 });
    //ipc.send("tcp-connect", record);
  };

  const handleScan = e => {
    e.preventDefault();
    const message = makeMessage(Op.atop_invite /*, { messageNo: 0 }*/);

    console.log("scan ");
    ipc.send("broadcasting", { message, port: 55954 });
  };

  const handleURLChanged = e => {
    e.preventDefault();
    const v = (e.target && e.target.value) || "";
    setUrl(v);
  };

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <Row gutter={16}>
        <Col span={10} style={{ display: "flex" }}>
          <Input placeholder="url:" value={url} onChange={handleURLChanged} />
        </Col>

        <Col span={5}>
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            onClick={handleConnect}
          >
            Connect
          </Button>
        </Col>
        <Col span={5}>
          <Button
            type="primary"
            style={{ marginLeft: "10px" }}
            onClick={handleScan}
          >
            Scan
          </Button>
        </Col>
      </Row>
      <Row className="ui__row">
        <Col span={24}>
          <ConnectAlert {...currentStatus} />
        </Col>
      </Row>
      <Row className="ui_row">
        <Col span={24}>
          <Collapse collapse={rollers.length === 0}>
            <RollerTable
              rollers={rollers}
              rowClick={handleRollersTableRowClick}
            />
          </Collapse>
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
