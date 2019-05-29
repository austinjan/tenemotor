// Describe roller protocol
import React from "react";
import { Typography } from "antd";
import MessagePackage from "./MessagePackage";
import ReadCommandPng from "./read-command.png";
const { Text, Paragraph, Title } = Typography;

const ProtocolPage = props => {
  return (
    <div className="pp-container">
      {/* Potocol description */}
      <Title level={3}>Protocol</Title>
      <Paragraph>
        This Protocol is a simple messaging structure, used to communication
        between roller control card and other system (i.e. computer). The
        message which transfered to roller control card have two part. one is
        operation code the other is roller command package:
      </Paragraph>
      {/* Read command description */}
      <Title level={4}> Read command</Title>
      <Text>
        To set 4th byte of package (6th byte of message) as 0x01 to defined read
        command. Roller control card will return message with information
      </Text>
      <br />
      <img
        src={ReadCommandPng}
        style={{ width: "50%", padding: "8px 0px" }}
        alt="Read command"
      />

      {/* Message table block */}
      <MessagePackage {...props} />
    </div>
  );
};

export default ProtocolPage;
