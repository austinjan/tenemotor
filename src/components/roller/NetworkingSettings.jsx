import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useInput } from "react-hanger";
import { Modal, Button } from "antd";
import "./NetworkingSettings.less";
import { sendUDPMessage } from "libs/udp/udputils";
import {
  DEFAULT_UDP_BROADCASTING_PORT,
  Op,
  makeMessage
} from "libs/roller/rollerutils";
import { updatePartiallyEmittedExpression } from "typescript";

const NetworkingSettings = props => {
  const { rollerSettings, visible, onCancel, onOk } = props;
  const ipaddress = useInput("");
  const host = useInput("");
  const subnet = useInput("");
  const gateway = useInput("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ipaddress.setValue(rollerSettings.ip);
    host.setValue(rollerSettings.host);
    subnet.setValue(rollerSettings.subnet);
    gateway.setValue(rollerSettings.gateway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollerSettings]);

  const handleSubmit = () => {
    setLoading(true);
    //{ip, oldip, subnet, gateway, host}
    const msg = makeMessage(Op.config, {
      oldip: rollerSettings.ip,
      ip: ipaddress.value,
      subnet: subnet.value,
      gateway: gateway.value,
      host: host.value,
      mac: rollerSettings.mac
    });
    console.log("handle submit: ", msg);
    sendUDPMessage(msg, rollerSettings.ip, DEFAULT_UDP_BROADCASTING_PORT);
    setTimeout(() => {
      setLoading(false);
      onOk();
    }, 1000);
  };

  return (
    <Modal
      visible={visible}
      title="Setting networking options"
      okText="Ok"
      onCancel={onCancel}
      onOk={onOk}
      footer={[
        <Button key="back" onClick={onCancel}>
          Return
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      ]}
    >
      <div>
        <form>
          <label>IP address: </label>
          <input
            type="url"
            value={ipaddress.value}
            onChange={ipaddress.onChange}
          />

          <label>Host:</label>
          <input type="text" value={host.value} onChange={host.onChange} />
          <label>Subnet mask:</label>
          <input type="url" value={subnet.value} onChange={subnet.onChange} />
          <label>Gateway:</label>
          <input type="url" value={gateway.value} onChange={gateway.onChange} />
        </form>
      </div>
    </Modal>
  );
};

NetworkingSettings.propTypes = {
  rollerSettings: PropTypes.shape({
    ip: PropTypes.string,
    subnetMask: PropTypes.string,
    gateway: PropTypes.string,
    host: PropTypes.string
  })
};

NetworkingSettings.defaultProps = {
  rollerSettings: {
    ip: "10.0.50.100",
    subnetMask: "255.255.255.0",
    gateway: "0.0.0.0",
    host: "test"
  }
};
export default NetworkingSettings;
