import React, { useEffect, useState } from "react";
import { Input, Typography, Select, InputNumber } from "antd";

import { getHexString, convertStringToByteArray } from "libs/udp/BinaryUtils";
import { parseRollerPackage } from "libs/roller/rollerutils";
import "./ProtocolPage.less";
import is from "ramda/src/is";
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
  const buffer = is(String)(data) ? convertStringToByteArray(data) : data;
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

/**
 * props:
 * rollerPackage:  use makeRollerPacakge({*}) make real package
 * showDetail: show more information
 *
 *  handleCommandChanged,
    handleRWChanged,
    handleDataChanged,
    handleMotorIDChanged
 */
const RollerPackage = props => {
  const { rollerPackage, showDetail } = props;
  const {
    handleCommandChanged,
    handleRWChanged,
    handleDataChanged,
    handleMotorIDChanged
  } = props;

  const [parsedPackage, setParsedPackage] = useState(
    parseRollerPackage(rollerPackage)
  );

  useEffect(() => {
    console.log("RollerPackage useEffect");
    setParsedPackage(parseRollerPackage(rollerPackage));
  }, [rollerPackage]);

  return (
    <div>
      <Title level={4}>Package</Title>
      {showDetail ? (
        <>
          <Paragraph>
            The op code of roller control card is 0xA0. Package please refer
            below.
          </Paragraph>
          <Text code>Raw Package: [ {parsedPackage.packageHexString} ]</Text>
        </>
      ) : null}

      <table>
        <thead>
          <tr>
            <td>HEADER</td>
            <td>LENGTH</td>
            <td>CMD</td>
            <td>MotorID | R/W</td>
            <td>DATA</td>
            <td>CHKSUM8</td>
            <td>EOF</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0x55</td>
            <td>{getHexString(parsedPackage.length, "0x")}</td>
            <td>{getHexString(parsedPackage.command, "0x")}</td>
            <td>
              {parsedPackage.motorID} | {parsedPackage.rw ? "R" : "W"}
            </td>
            <td> {getDataDom(parsedPackage.data)} </td>
            <td> {getHexString(parsedPackage.checkSum, "0x")} </td>
            <td>0X00</td>
          </tr>
        </tbody>
      </table>

      <div className="pp-setting-area">
        <Title level={4}>Setting package</Title>
        <div className="ui__row">
          <span>Command: </span>
          <Select
            defaultValue={parsedPackage.command}
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
          <Select
            defaultValue={parsedPackage.rw}
            onChange={handleRWChanged}
            key="option_rw"
          >
            <Option value={0}>W</Option>
            <Option value={1}>R</Option>
          </Select>
          <span>Motor ID: </span>{" "}
          <InputNumber max={15} min={0} onChange={handleMotorIDChanged} />
        </div>

        <div className="ui__row">
          <span>Data(HEX) </span> <Input onChange={handleDataChanged} />
        </div>
      </div>
    </div>
  );
};

export default RollerPackage;
