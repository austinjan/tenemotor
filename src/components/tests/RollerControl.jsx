import React, { useState, useReducer, useCallback, useEffect } from "react";
import { Input, Button, Typography, Row, Col, Alert } from "antd";
import RollerControlPanel from "./RollerCongrolPanel";
import Collapse from "components/layout/Collapse";
import RollerTable from "components/roller/RollerTable";

import "App.less";
import {
  makeMessage,
  Op,
  RollerParser,
  useUDPLitsener,
  useTCPSocket,
  ConnectStatus
} from "libs/udp/rollerutils";

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
  const [port, setPort] = useState(5566);
  const [destination, setDestination] = useState({});
  const [rollers, dispatchRollers] = useReducer(rollerReducer, []);

  const response = useUDPLitsener(55954);
  const [currentStatus, receiveTarget, sendData] = useTCPSocket(destination);

  useEffect(() => {
    const real_response = response.response || response || new Uint8Array(3);
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
    const message = makeMessage(Op.roller, {
      command: 0x00,
      rw: 0x01,
      data: new Uint8Array()
    });
    console.log("Test connect ", currentStatus);
    if (currentStatus === ConnectStatus.state.connected) {
      sendData(message);
    }
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

  const handleIpChanged = e => {
    e.preventDefault();
    const v = (e.target && e.target.value) || "";
    setDestination(pre => ({ ...pre, ip: v }));
  };

  const handlePortChanged = e => {
    e.preventDefault();
    const v = (e.target && e.target.value) || "";
    setDestination(pre => ({ ...pre, port: v }));
    setPort(v);
  };

  const ConnectAlert = (
    <Alert
      message={ConnectStatus.text[currentStatus]}
      type={ConnectStatus.type[currentStatus]}
      showIcon
    />
  );

  return (
    <div>
      <Typography.Title level={2}>Roller control panel</Typography.Title>
      <Row gutter={16}>
        <Col span={10} style={{ display: "flex" }}>
          <Input
            placeholder="Input IP address"
            value={destination.ip}
            onChange={handleIpChanged}
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Port"
            value={destination.port}
            onChange={handlePortChanged}
          />
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
      <Row className="ui__row">
        <Col span={24}>{ConnectAlert}</Col>
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
