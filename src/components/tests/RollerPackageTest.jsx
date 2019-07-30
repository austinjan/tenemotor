// @flow
import React, { useState, useEffect } from "react";

import RollerPackage from "components/protocol/RollerPackage";
import RollerResponse from "components/protocol/RollerResponse";
import ConnectionAlert from "components/roller/ConnectionAlert";
import {
  makeRollerPackage,
  Op,
  makeMessage,
  useRollerPackage
} from "libs/roller";
import isEmpty from "ramda/src/isEmpty";
import { useTCPSocket } from "libs/tcp/hooks";
import { useAtopUDPMonitor } from "libs/udp/hooks";
import ConnectRoller from "components/roller/ConnectRoller";
import { Button, Typography } from "antd";
const { Title, Text } = Typography;

const RollerPackageTest = () => {
  const [packageOpt, packageHandlers] = useRollerPackage({});
  const [rollers, Scan] = useAtopUDPMonitor(55954);
  const [destination, setDestination] = useState({});
  const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);

  useEffect(() => {
    console.log("Roller Package test use effect....");
    Scan();
  }, [Scan]);

  const connectSocket = (dest: { ip: String, mac: String }) => {
    setDestination(dest);
  };

  const handleSend = () => {
    console.log("sending... ", packageOpt);
    const msg = makeMessage(Op.roller, packageOpt);

    sendData(msg);
  };

  return (
    <>
      <Title level={3}> Connet </Title>
      <ConnectionAlert {...currentStatus} />

      <ConnectRoller onConnect={connectSocket} rollers={rollers} />
      <RollerPackage
        rollerPackage={makeRollerPackage(packageOpt)}
        showDetail={true}
        {...packageHandlers}
      />
      <div className="ui__row">
        <Button onClick={handleSend}> Send </Button>
      </div>
      <RollerResponse pkg={tcpResponse} />
    </>
  );
};

export default RollerPackageTest;