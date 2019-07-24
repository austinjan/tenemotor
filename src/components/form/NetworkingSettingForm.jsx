// @flow
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import "./formStyle.less";

const ErrorDiv = props => <div style={{ color: "red" }}>{props.children}</div>;

const validator = yup.object().shape({
  ip: yup
    .string()
    .required()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  subnet: yup
    .string()
    .required()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  gateway: yup
    .string()
    .required()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  host: yup.string().required()
});

type tProps = {
  settings: {
    ip: String,
    subnet: String,
    gateway: String,
    host: String
  }
};

const NetworkingSettingForm = props => {
  const { settings } = props;
  const [netSettings, setNetSettings] = useState(settings);
  return (
    <div>
      <Formik
        initialValues={settings}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
          setNetSettings({ ...netSettings, ...values });
        }}
        validationSchema={validator}
      >
        {({ errors, touched }) => (
          <Form className="form-inline">
            <label for="ip">End of Zone (true=1 false=0) : </label>
            <Field name="ip" type="text" />
            <ErrorMessage name="eoz" component={ErrorDiv} />
            <label for="subnet">End of Zone (true=1 false=0) : </label>
            <Field name="subnet" type="text" />
            <ErrorMessage name="eoz" component={ErrorDiv} />
            <label for="gateway">End of Zone (true=1 false=0) : </label>
            <Field name="gateway" type="text" />
            <ErrorMessage name="eoz" component={ErrorDiv} />
            <label for="host">End of Zone (true=1 false=0) : </label>
            <Field name="host" type="text" />
            <ErrorMessage name="eoz" component={ErrorDiv} />

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
      <pre>{JSON.stringify(settings, 0, 2)}</pre>
    </div>
  );
};

export default NetworkingSettingForm;
