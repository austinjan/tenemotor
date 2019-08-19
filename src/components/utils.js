import { useState } from "react";

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

  return [
    { alertMsg, alertType, showAlert },
    displayInfo,
    displayError,
    hideAlert
  ];
};

export { useAlert };
