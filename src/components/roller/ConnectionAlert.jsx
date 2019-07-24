// @flow
import React from "react";

import Collapse from "components/layout/Collapse";
import { Alert } from "antd";
/**
 * 提供統一介面處理訊息 (Error, Info, Warning...)
 * hide: bool , type : success | info | warning | error , message : string
 */
type Props = {
  type: String,
  message: String
};

const ConnectionAlert = (props: Props) => {
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
