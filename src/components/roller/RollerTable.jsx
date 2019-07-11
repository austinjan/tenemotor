import React from "react";
import PropTypes from "prop-types";
import { Table, Button, Divider } from "antd";

const { Column } = Table;

const RollerTable = props => {
  const { rollers, onConnect, onSetting } = props;
  //const arraySize = Array.isArray(rollers) && rollers.length;

  return (
    <div>
      <Table dataSource={rollers}>
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="IP Address" dataIndex="ip" key="ip" />
        <Column title="MAC Address" dataIndex="mac" key="mac" />
        <Column title="Gateway" dataIndex="gateway" key="gateway" />
        <Column title="Subnet" dataIndex="subnet" key="subnet" />

        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            <span>
              <Button
                onClick={() => {
                  //console.log("button click ", text, record);
                  onConnect(record);
                }}
              >
                Connect
              </Button>
              <Divider type="vertical" />
              <Button
                onClick={() => {
                  onSetting(record);
                }}
              >
                Setting
              </Button>
            </span>
          )}
        />
      </Table>
    </div>
  );
};

RollerTable.propTypes = {
  rollers: PropTypes.array,
  onConnect: PropTypes.func,
  onSetting: PropTypes.func
};

RollerTable.defaultProps = {
  rollers: [],
  onConnect: () => {
    console.log("empty onConnect!");
  },
  onSetting: () => {
    console.log("empty onSetting!");
  }
};

export default RollerTable;
