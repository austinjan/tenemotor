// @flow
import React, { useState } from "react";
import { Alert } from "antd";

const AlertContext = React.createContext<any>();

const AlertProvider = (props: any) => {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("");

  const { children } = props;

  const info = (text: string) => {
    setText(text);
    setType("info");
    setShow(true);
  };

  const error = (text: string) => {
    setText(text);
    setType("error");
    setShow(true);
  };

  const hide = () => {
    setShow(false);
  };

  const handleClose = e => {
    e.preventDefault();
    setShow(false);
  };

  return (
    <AlertContext.Provider value={{ info, error, hide }}>
      {show ? (
        <Alert message={text} type={type} onClose={handleClose} closable />
      ) : null}
      {children}
    </AlertContext.Provider>
  );
};

export { AlertProvider, AlertContext };
