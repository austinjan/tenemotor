import React from "react";
import { useInput } from "react-hanger";
import RollerPackage from "components/protocol/RollerPackage";
import * as R from "ramda";

const getLength = pkg => pkg[1];
const getDataLength = R.compose(
  R.subtract(R.__, 2),
  getLength
);
const getIDnRW = R.slice(3, 4);

const getMotorID = R.compose(
  data => (data & 0xf0) >> 4,
  getIDnRW
);

// Package -> String: 'r' | 'w'
const getRW = R.compose(
  data => ((data & 0x0f) === 1 ? "r" : "w"),
  getIDnRW
);

//const pkg = [0x55, 0x06, 0x01, 0x11, 0x0f, 0x0b, 0x0a, 0x0d, 0x0a, 0x00]

const getData = pkg => {
  const dataEnd = getDataLength(pkg) + 4;
  return R.slice(4, dataEnd)(pkg);
};
// (pkg)=> {
//   const dataLeng = getLength(pkg) - 2;
//   const rawData = R.slice(4, dataLeng)
// }

const RollerPackageTest = props => {
  return (
    <>
      <h2>Roller package testing</h2>
      <RollerPackage />
    </>
  );
};

export default RollerPackageTest;
