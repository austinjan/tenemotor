// Roller udp package message description and test
import React from "react";
import { InputNumber, Typography, Divider } from "antd";
import PropTypes from "prop-types";

import RollerPackage from "./RollerPackage";

import {
  getHexString,
  getDWHexString,
  convertStringToByteArray
} from "libs/udp/BinaryUtils";

import "./ProtocolPage.less";
const { Text, Paragraph, Title } = Typography;

// Component start here
const MessagePackage = props => {
  const { value, handleMessageNoChanged } = props;

  // get package | Ox55 | LEN | CMD | R/W | DATA[0] ... | CHKSUM | EOF |
  // -> Uint8Array
  const getPackage = () => {
    let arr = [0x55, getPackageLength(), value.command, value.rw];
    // add data to arr
    let dataArray = convertStringToByteArray(value.data);
    dataArray.forEach(v => arr.push(v));
    // check sum
    let checkSum = 0;
    dataArray.forEach(v => (checkSum += v));
    arr.push(checkSum & 255);

    arr.push(0x00);
    return new Uint8Array(arr);
  };
  // convert package to string
  const getPackageString = () => {
    const data = getPackage();
    const stringArray = [];

    data.forEach(v => stringArray.push(getHexString(v, " 0x")));

    return stringArray;
  };
  const getPackageLength = () => Math.ceil(value.data.length / 2) + 2;

  return (
    <div>
      <Title level={4}>Message</Title>
      <table>
        <thead>
          <tr>
            <td colSpan={4}>Head</td>
            <td rowSpan={2}>Roller Package</td>
          </tr>
          <tr>
            <td>Op (byte)</td>
            <td>Message ID</td>
            <td colSpan={2}>Flag</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0xA0</td>
            <td>{getHexString(value.messageNo, "0x")}</td>
            <td colSpan={2}>0x00 0x00</td>
            <td> {getPackageString()} </td>
          </tr>
        </tbody>
      </table>

      <Paragraph type="warning">
        The maximum size of message is 256 bytes. The maximum size of package is
        254 bytes.
      </Paragraph>

      <Text code>
        Example: [ 0xA0 {getDWHexString(value.messageNo, "0x")}{" "}
        {getPackageString()} ]
      </Text>

      <div className="pp-setting-area">
        <Title level={4}>Setting Head</Title>
        <div className="ui__row">
          <span>#Message(HEX)</span>
          <InputNumber
            min={0}
            max={0xff}
            value={value.messageNo}
            formatter={value => value.toString(16)}
            parser={value => parseInt(value, 16)}
            onChange={handleMessageNoChanged}
          />
        </div>
      </div>

      <Divider />

      {/* const {packageLength, packageString, command, rw, data } = props;
      const {handleCommandChanged, handleRWChanged, handleDataChanged } = props; */}
      <RollerPackage
        packageLength={getPackageLength()}
        packageString={getPackageString()}
        handleCommandChanged={props.handleCommandChanged}
        handleRWChanged={props.handleRWChanged}
        handleDataChanged={props.handleDataChanged}
        {...value}
      />
    </div>
  );
};

MessagePackage.propTypes = {
  value: PropTypes.shape({
    data: PropTypes.string,
    rw: PropTypes.number,
    command: PropTypes.number,
    messageNo: PropTypes.number
  }),
  handleCommandChanged: PropTypes.func.isRequired,
  handleRWChanged: PropTypes.func.isRequired,
  handleDataChanged: PropTypes.func.isRequired
};

MessagePackage.defaultProps = {
  handleCommandChanged: () => {
    console.log(
      "MessagePackage.jsx handleCommandChanged default!!! you should pass real handler."
    );
  },
  handleRWChanged: () => {
    console.log(
      "MessagePackage.jsx handleRWChanged default!!! you should pass real handler."
    );
  },
  handleDataChanged: () => {
    console.log(
      "MessagePackage.jsx handleDataChanged default!!! you should pass real handler."
    );
  }
};
export default MessagePackage;
