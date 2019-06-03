import React from "react";
import { Input, Typography, Select } from "antd";

import {
  getHexString,
  getDWHexString,
  convertStringToByteArray
} from "libs/udp/BinaryUtils";

import "./ProtocolPage.less";
const { Text, Paragraph, Title } = Typography;
const { Option } = Select;

const commandOption = [
  { value: 0, text: "InValid(0x00)" },
  { value: 1, text: "Phase Current" },
  { value: 2, text: "Period(0x02)" },
  { value: 3, text: "Temperature(0x03)" },
  { value: 4, text: "Fuzzy Member F(0x04)" },
  { value: 5, text: "GPIO Status(0x05)" },
  { value: 6, text: "Get Params(0x06)" },
  { value: 7, text: "Motor Run/Stop(0x07)" },
  { value: 8, text: "Motor Speed(0x08)" },
  { value: 0xe0, text: "Connet Device(0xE0)" }
];

// data: 7FAB1132... => <tr>32</tr> <tr>11</tr> ...
const getDataDom = data => {
  const buffer = convertStringToByteArray(data);
  let domArray = [];
  for (let i = 0; i < buffer.length; i++) {
    domArray.push(
      <td
        key={i}
        style={{
          border: "1px solid #d9d9d9",
          padding: "4px 4px",
          backgroundColor: "#fff"
        }}
      >
        {getHexString(buffer[i])}
      </td>
    );
  }

  return (
    <table style={{ padding: "4px 4px" }}>
      <tbody>
        <tr>{domArray}</tr>
      </tbody>
    </table>
  );
};

// uint8 checksum data is UInt8
const getCheckSum8 = data => {
  let sum = 0;
  const arr = convertStringToByteArray(data);
  arr.forEach(v => (sum += v));
  const sumStr = getHexString(sum & 255);

  return sumStr;
};

const RollerPackage = props => {
  const { packageLength, packageString, command, rw, data, showDetail } = props;
  const { handleCommandChanged, handleRWChanged, handleDataChanged } = props;
  return (
    <div>
      <Title level={4}>Package</Title>
      {showDetail ? (
        <>
          <Paragraph>
            The op code of roller control card is 0xA0. Package please refer
            below.
          </Paragraph>
          <Text code>Raw Package: [ {packageString} ]</Text>
        </>
      ) : null}

      <table>
        <thead>
          <tr>
            <td>HEADER</td>
            <td>LENGTH</td>
            <td>CMD</td>
            <td>R/W</td>
            <td>DATA</td>
            <td>CHKSUM8</td>
            <td>EOF</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0x55</td>
            <td>{packageLength}</td>
            <td>{getHexString(command, "0x")}</td>
            <td>{rw ? "R" : "W"}</td>
            <td> {getDataDom(data)} </td>
            <td> {getCheckSum8(data)} </td>
            <td>0X00</td>
          </tr>
        </tbody>
      </table>

      <div className="pp-setting-area">
        <Title level={4}>Setting package</Title>
        <div className="ui__row">
          <span>Command: </span>
          <Select
            defaultValue={1}
            onChange={handleCommandChanged}
            key="option_command"
          >
            {commandOption.map((item, i) => (
              <Option key={i} value={item.value}>
                {item.text}
              </Option>
            ))}
          </Select>
          <span>R/W: </span>
          <Select defaultValue={1} onChange={handleRWChanged} key="option_rw">
            <Option value={0}>W</Option>
            <Option value={1}>R</Option>
          </Select>
        </div>

        <div className="ui__row">
          <span>Data(HEX) </span> <Input onChange={handleDataChanged} />
        </div>
      </div>
    </div>
  );
};

export default RollerPackage;
