// @flow
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "antd";
import * as yup from "yup";
import { sendUDPMessage } from "libs/udp/udputils";
import {
  DEFAULT_UDP_BROADCASTING_PORT,
  Op,
  makeMessage
} from "libs/roller/rollerutils";
import mergeLeft from "ramda/src/mergeLeft";

// $FlowFixMe
import "./formStyle.less";

const ErrorDiv = props => (
  <div className="entire_row" style={{ color: "red" }}>
    {props.children}
  </div>
);

const validator = yup.object().shape({
  ip: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address.")
    .required(),
  subnet: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address.")
    .required(),
  gateway: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address.")
    .required(),
  host: yup.string()
});

type tProps = {
  onCancel: Function,
  onValueChanged: any => void,
  rollerSettings: {
    ip: string,
    mac: string,
    subnet: string,
    gateway: string,
    host: string
  }
};

const NetworkingSettingForm = (props: tProps) => {
  const { onCancel, rollerSettings, onValueChanged } = props;

  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Formik
        initialValues={rollerSettings}
        onSubmit={(values, actions) => {
          const newRollerSettings = mergeLeft(values, rollerSettings);
          console.log("submiiiiiittttttt");
          actions.setSubmitting(false);
          setLoading(true);
          const msg = makeMessage(Op.config, {
            oldip: rollerSettings.ip,
            ip: values.ip,
            subnet: values.subnet,
            gateway: values.gateway,
            host: values.host,
            mac: rollerSettings.mac
          });
          sendUDPMessage(msg, rollerSettings.ip, DEFAULT_UDP_BROADCASTING_PORT);
          onValueChanged(newRollerSettings);
          setTimeout(() => {
            setLoading(false);
            onCancel();
          }, 1000);
        }}
        validationSchema={validator}
        render={({ errors, touched, isValidating }) => (
          <Form className="form-inline">
            <label>Mac : </label>{" "}
            <span className="form_info">{rollerSettings.mac}</span>
            <label> Name : </label>
            <Field name="name" type="text" />
            <ErrorMessage name="name" component={ErrorDiv} />
            <label for="ip">IP Address : </label>
            <Field name="ip" type="text" />
            <ErrorMessage name="ip" component={ErrorDiv} />
            <label for="subnet">Subnet Mask : </label>
            <Field name="subnet" type="text" />
            <ErrorMessage name="subnet" component={ErrorDiv} />
            <label for="gateway">Gateway : </label>
            <Field name="gateway" type="text" />
            <ErrorMessage name="gateway" component={ErrorDiv} />
            <label for="host">Host : </label>
            <Field name="host" type="text" />
            <ErrorMessage name="host" component={ErrorDiv} />
            <Button onClick={onCancel} className="btn_cancel">
              Cancel
            </Button>
            <Button htmlType="submit" loading={loading} disabled={isValidating}>
              Submit
            </Button>
            <span>isValidating {isValidating} </span>
          </Form>
        )}
      />
    </div>
  );
};

export default NetworkingSettingForm;
