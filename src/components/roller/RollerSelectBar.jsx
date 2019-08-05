// @flow
import React from "react";
import { Button, Divider, Icon } from "antd";
// $FlowFixMe
import "./RollerSelector.less";

type tProps = {
  name?: string,
  ip?: string,
  mac?: string,
  showTable: boolean,
  showInfo: boolean,
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
    showInfo,
    onScan,
    onSetting,
    toggleShowTable,
    toggleInfo
  } = props;
  const displayName = name || "Undefined";

  return (
    <div className="ui__bar">
      <span>{displayName}</span> <Divider type="vertical" />
      <span>{ip}</span>
      <Divider type="vertical" />
      <span className="bar_anchor">{mac}</span>
      <Button className="btn" shape="circle" onClick={onScan} size="small">
        <Icon type="search" />
      </Button>
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
      <Button className="btn" shape="circle" size="small" onClick={toggleInfo}>
        <Icon
          type="more"
          theme="twoTone"
          twoToneColor={showInfo ? "#3333ff" : "#b3b3b3"}
        />
      </Button>
    </div>
  );
};
export default RollerSelectBar;
