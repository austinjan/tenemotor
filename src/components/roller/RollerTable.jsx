import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";

const { Column, ColumnGroup } = Table;

const RollerTable = props => {
  const { rollers, rowClick } = props;
  //const arraySize = Array.isArray(rollers) && rollers.length;

  return (
    <div>
      <Table dataSource={rollers}>
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="IP Address" dataIndex="ip" key="ip" />
        <Column title="MAC Address" dataIndex="mac" key="mac" />
        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            <span>
              <Button
                onClick={() => {
                  //console.log("button click ", text, record);
                  rowClick(record);
                }}
              >
                Connect
              </Button>
            </span>
          )}
        />
      </Table>
    </div>
  );
};
RollerTable.propTypes = {
  rollers: PropTypes.array.isRequired,
  rowClick: PropTypes.func
};
RollerTable.defaultProps = {
  rollers: []
};

export default RollerTable;
