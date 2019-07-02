import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Collapse from "components/layout/Collapse";
import { Alert } from "antd";
/**
 * 提供統一介面處理訊息 (Error, Info, Warning...)
 * hide: bool , type : success | info | warning | error , message : string
 */

// const validProps = props => {
//   const type = props.type || 'info';
//   const message = props.message || 'Empty message';
//   return {hide, type, message}
// }
const ConnectionAlert = props => {
  const { type = "info", message = "Empty message" } = props;
  const hasMessage = message.length > 0 ? true : false;

  return (
    <>
      <Collapse collapse={!hasMessage}>
        <Alert type={type} message={message} closable showIcon />
      </Collapse>
    </>
  );
};
export default ConnectionAlert;
