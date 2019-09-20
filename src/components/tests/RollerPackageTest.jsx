// @flow
import React, { useState, useEffect, useContext } from "react";
import { AlertContext } from "components/alertutils";
import RollerPackage from "components/protocol/RollerPackage";
import RollerResponse from "components/protocol/RollerResponse";
import {
  makeRollerPackage,
  Op,
  makeMessage,
  useRollerPackage
} from "libs/roller";

import { useTCPSocket } from "libs/tcp/hooks";
import { useAtopUDPMonitor } from "libs/udp/hooks";
import { Button, Typography } from "antd";
import ConnectSocket from "components/protocol/ConnectSocket";
const { Title } = Typography;

const testRollers = [{ ip: "1.2.3.4" }, { ip: "2,4,6,8", port: 4455 }];
const RollerPackageTest = () => {
  const alert = useContext(AlertContext);
  const [packageOpt, packageHandlers] = useRollerPackage({});
  const [rollers, Scan] = useAtopUDPMonitor(55954);
  const [tcpResponse, setTcpResponse] = useState();
  const [destination, setDestination] = useState({});
  const { api, connecting } = useTCPSocket({
    onData: data => {
      console.log(data);
      const hex = data.map(v => "0x" + v.toString(16)).join(" ");
      alert.info(`Receive ` + hex);
      setTcpResponse(data);
    },
    onError: err => console.log(err)
  });

  useEffect(() => {
    console.log("Roller Package test use effect....");
    Scan();
  }, [Scan]);

  useEffect(() => {
    return () => {
      api.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectSocket = (dest: { ip: String, mac: String }) => {
    setDestination(dest);
    api.connect(dest.ip);
  };

  const handleSend = () => {
    console.log("sending... ", packageOpt);
    const msg = makeMessage(Op.roller, packageOpt);
    api.send(msg);
  };

  return (
    <>
      <Title level={3}> Connet </Title>

      <ConnectSocket
        rollers={rollers}
        connecting={connecting}
        connect={connectSocket}
        disconnect={api.disconnect}
      />
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
