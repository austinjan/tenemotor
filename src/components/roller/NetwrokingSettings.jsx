import React, { useState } from "react";
import PropTypes from "prop-types";
import { Checkbox, Input } from "antd";

const NetworkingSettings = props => {
  const { ip,  } = props;
  const [dhcp, setDHCP] = useState(false);
  return (
    <>
      <p>Please set the appropriate IP settings for this device. ()</p>
    </>
    <Checkbox onChange={handleDHCPChanged} checked={dhcp}>DHCP (Obtain an IP automatically)</Checkbox>
  );
};

NetworkingSettings.propTypes = {
  ip: PropTypes.string.isRequired
};
