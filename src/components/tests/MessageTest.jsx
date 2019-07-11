import React, { useState } from "react";
import { Input, Button, InputNumber, Switch } from "antd";
// import MonacoEditor from "react-monaco-editor";
import ReceivePackage from "components/protocol/ReceivePackage";
import { Op, makeMessage, test } from "libs/roller/rollerutils";
import ProtocolPage from "components/protocol/ProtocolPage";
import "App.less";

//=================================================================
// Component
//=================================================================
const MessageTest = props => {
  const [settings, setSettings] = useState({
    url: "192.168.33.159",
    data: '{"hello":"udp"}',

    value: {
      data: [],
      rw: 1,
      command: 1,
      messageNo: 1,
      motorID: 0
    },
    port: 5566,
    listen: false
  });

  const sendData = () => {
    let sendData;

    let dataArray = [];
    const dataBytes = Math.ceil(settings.value.data.length / 2);
    let cursor = settings.value.data.length;
    for (let i = 0; i < dataBytes; i++) {
      dataArray[i] = parseInt(
        settings.value.data.slice(cursor - 2, cursor),
        16
      );
      cursor -= 2;
    }
    let data = { ...settings.value, data: new Uint8Array(dataArray) };
    sendData = makeMessage(Op.roller, data);

    //send data here
  };

  const handleURLChanged = e => {
    e.preventDefault();
    const value = e.target.value;
    setSettings(pre => ({ ...pre, url: value }));
  };

  const handlePortChanged = value => {
    setSettings(pre => ({ ...pre, port: value }));
  };

  const handleDataChanged = (newValue, e) => {
    setSettings(pre => ({ ...pre, data: newValue }));
  };

  const handleBinDataChanged = e => {
    const newData = e.target.value;
    setSettings(pre => ({ ...pre, value: { ...pre.value, data: newData } }));
  };
  const handleMessageNoChanged = v => {
    let newData = typeof v === "number" ? v : parseInt(v || 0, 16);

    setSettings(pre => ({
      ...pre,
      value: { ...pre.value, messageNo: newData }
    }));
  };
  const handleCommandChanged = v => {
    const newCmd = v || 0;
    setSettings(pre => ({ ...pre, value: { ...pre.value, command: newCmd } }));
  };

  const handleRWChanged = v => {
    const newRW = v || 0;
    setSettings(pre => ({ ...pre, value: { ...pre.value, rw: newRW } }));
  };

  const handleMotorIDChanged = v => {
    const newRW = v || 0;
    setSettings(pre => ({ ...pre, value: { ...pre.value, motorID: newRW } }));
  };

  const handleSend = e => {
    e.preventDefault();

    sendData();
  };

  const dataElement = (
    <div style={{ margin: "8px 0px" }}>
      <ProtocolPage
        value={settings.value}
        handleDataChanged={handleBinDataChanged}
        handleCommandChanged={handleCommandChanged}
        handleRWChanged={handleRWChanged}
        handleMessageNoChanged={handleMessageNoChanged}
        handleMotorIDChanged={handleMotorIDChanged}
      />
    </div>
  );
  return (
    <div>
      <div className="ui__row">
        <span> URL: </span>
        <Input
          className="ui__row-largeitem"
          placeholder="Destination IP: (192.168.1.1 | localhost )"
          value={settings.url}
          onChange={handleURLChanged}
        />
        <span style={{ marginLeft: "8px" }}> Port: </span>
        <InputNumber
          className="ui__row-item"
          value={settings.port}
          onChange={handlePortChanged}
        />
      </div>

      {dataElement}
      <Button type="primary" onClick={handleSend}>
        Send
      </Button>
      <Button onClick={test}>Test</Button>
      <ReceivePackage port={settings.port} />
    </div>
  );
};

export default MessageTest;
