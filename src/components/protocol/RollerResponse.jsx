import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { parseRollerPackage } from "libs/roller/rollerutils";
import { getHexString } from "libs/udp/BinaryUtils";
import { Typography } from "antd";
import * as R from "ramda";

const { Text, Title } = Typography;

const indexReduce = R.addIndex(R.reduce(R.__, 0));

const array2Num = indexReduce((acc, v, idx) => {
  return acc | (v << (idx * 8));
});

const bigEndian2Number = buffer => {
  try {
    return array2Num(buffer);
  } catch (err) {
    console.log("bigEndian2Number err ", err, buffer);
    return 0;
  }
};

const RollerResponse = props => {
  const { pkg } = props;
  console.log("RollerResponse props ", props);
  const [parsedPackage, setParsedPackage] = useState({});
  useEffect(() => {
    setParsedPackage(parseRollerPackage(pkg.slice(4)));
  }, [pkg]);

  return (
    <div style={{ marginTop: "15px" }}>
      <Title level={4}>Response</Title>
      <Text code>Raw Package: [ {parsedPackage.string} ]</Text>
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
            <td> {bigEndian2Number(parsedPackage.data)} </td>
            <td> {getHexString(parsedPackage.checkSum, "0x")} </td>
            <td>0X00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

RollerResponse.propTypes = {
  pkg: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(Uint8Array)])
};
RollerResponse.defaultProps = {
  pkg: []
};

export default RollerResponse;
