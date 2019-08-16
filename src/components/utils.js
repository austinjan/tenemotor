import React, { useState } from "react";
import { Alert } from "antd";

const useAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState();
  const [alertType, setAlertType] = useState("info");

  const displayInfo = (msg: string): void => {
    setShowAlert(true);
    setAlertMsg(msg);
    setAlertType("info");
  };

  const displayError = (msg: string): void => {
    setShowAlert(true);
    setAlertMsg(msg);
    setAlertType("error");
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const alertComponent = showAlert ? (
    <Alert message={alertMsg} type={alertType} closable />
  ) : null;

  return [alertComponent, displayInfo, displayError, hideAlert];
};

export { useAlert };
