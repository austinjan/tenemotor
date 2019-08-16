// @flow
import React, { useEffect, useState } from "react";
import { Button, Divider, Icon } from "antd";
// $FlowFixMe
import "./RollerSelector.less";

type tProps = {
  name?: string,
  ip?: string,
  mac?: string,
  showTable: boolean,
  helpText: string,
  onScan: Function,
  onSetting: Function,
  toggleShowTable: Function,
  toggleInfo: Function
};
// const Hint = (text: string) =>
//   isEmpty(text) || text === undefined ? null : <span>{text}</span>;

const RollerSelectBar = (props: tProps) => {
  const {
    name,
    ip,
    mac,
    showTable,
    helpText,
    onScan,
    onSetting,
    toggleShowTable,
    toggleInfo
  } = props;
  const displayName = name || "Undefined";

  const [bindRoller, setBindRoller] = useState(false);
  const ipValidator = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  useEffect(() => {
    typeof ip === "string"
      ? setBindRoller(ipValidator.test(ip))
      : setBindRoller(false);
  }, [ip, ipValidator]);
  return (
    <div className="ui__bar">
      {bindRoller ? (
        <>
          <span>{displayName}</span> <Divider type="vertical" />
          <span>{ip}</span>
          <Divider type="vertical" />
          <span className="bar_anchor">{mac}</span>
        </>
      ) : (
        <span className="bar_anchor"> {helpText} </span>
      )}
      <Button className="btn" shape="circle" onClick={onScan} size="small">
        <Icon type="search" />
      </Button>
      {bindRoller ? (
        <>
          <Button
            className="btn"
            shape="circle"
            icon="setting"
            size="small"
            onClick={onSetting}
          />
          <Button
            className="btn"
            shape="circle"
            icon={showTable ? "caret-up" : "caret-down"}
            size="small"
            onClick={toggleShowTable}
          />
          <Button
            className="btn"
            shape="circle"
            size="small"
            onClick={toggleInfo}
          >
            <Icon type="more" />
          </Button>
        </>
      ) : null}
    </div>
  );
};
export default RollerSelectBar;
