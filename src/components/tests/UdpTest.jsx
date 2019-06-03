import React, { useState } from "react";
import { Input, Button, InputNumber, Switch } from "antd";
import MonacoEditor from "react-monaco-editor";
import ReceivePackage from "components/protocol/ReceivePackage";
import {
  takeSendWithResponseObservable,
  Op,
  makeMessage
} from "libs/udp/rollerutils";
import ProtocolPage from "components/protocol/ProtocolPage";
import "App.less";

const getMessage = value => {
  const dataBytes = Math.ceil(value.data.length / 2);
  const packageLength = dataBytes + 2;
  const buff = new ArrayBuffer(dataBytes);
  const dataArray = new Uint8Array(buff);
  let i;
  let cursor = value.data.length;
  for (i = 0; i < dataBytes; i++) {
    dataArray[i] = parseInt(value.data.slice(cursor - 2, cursor), 16);
    cursor -= 2;
  }

  let packageArray = [0x55, packageLength, value.command, value.rw];
  // add data to arr

  dataArray.forEach(v => packageArray.push(v));
  // check sum
  let checkSum = 0;
  dataArray.forEach(v => (checkSum += v));
  packageArray.push(checkSum & 255);
  packageArray.push(0x00);

  let messageArray = [0xa0, value.messageNo, 0x00, 0x00];
  messageArray = messageArray.concat(packageArray);
  return new Uint8Array(messageArray);
};

//=================================================================
// Component
//=================================================================
const UdpTest = props => {
  const [settings, setSettings] = useState({
    url: "192.168.33.159",
    data: '{"hello":"udp"}',

    value: {
      data: "",
      rw: 1,
      command: 1,
      messageNo: 1
    },
    port: 5566,
    listen: false
  });

  const [jsonData, setJsonData] = useState(false);

  const sendData = () => {
    let sendData;
    if (jsonData) {
      sendData = makeMessage(Op.json, settings.data);
    } else {
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
    }

    takeSendWithResponseObservable(
      sendData,
      settings.url,
      settings.port
    ).subscribe(
      val => console.log("takeSendWithResponseObservable: ", val),
      err => console.log("takeSendWithResponseObservable err: ", err)
    );
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

  const handleSend = e => {
    e.preventDefault();

    sendData();
  };

  const handleDataTypeChanged = (checked, e) => {
    setJsonData(checked);
  };
  const dataElement = jsonData ? (
    <div style={{ margin: "8px 0px" }}>
      <MonacoEditor
        language="json"
        height="300"
        options={{
          lineNumbers: "off",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorStyle: "line"
        }}
        theme="vs-dark"
        value={settings.data}
        onChange={handleDataChanged}
      />
    </div>
  ) : (
    <div style={{ margin: "8px 0px" }}>
      <ProtocolPage
        value={settings.value}
        handleDataChanged={handleBinDataChanged}
        handleCommandChanged={handleCommandChanged}
        handleRWChanged={handleRWChanged}
        handleMessageNoChanged={handleMessageNoChanged}
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

      <div className="ui__row">
        <span>Body: </span>
        <Switch
          checkedChildren="JSON"
          unCheckedChildren="BIN"
          defaultChecked={jsonData}
          onClick={handleDataTypeChanged}
        />
      </div>
      {dataElement}
      <Button type="primary" onClick={handleSend}>
        Send
      </Button>
      <ReceivePackage port={settings.port} />
    </div>
  );
};

export default UdpTest;
