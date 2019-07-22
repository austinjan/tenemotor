import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import "./formStyle.less";

const defaultValue = {
  eoz: 0,
  pe: 1, //clear=1, block-0
  halfSpeed: 0, //disable
  speed: 1,
  currentSpeed: 1,
  jamExprTime: 4, //JAM timer expiration time
  rumExprTime: 4, // run timer expiration time
  mode: 0 //Mode selection {Singulate, Slug, LongBox,...}
};

const ErrorDiv = props => <div style={{ color: "red" }}>{props.children}</div>;

const validator = yup.object().shape({
  eoz: yup
    .number()
    .required()
    .min(0)
    .max(1),
  pe: yup
    .number()
    .required()
    .min(0)
    .max(1),
  halfSpeed: yup
    .number()
    .required()
    .min(0)
    .max(1),
  speed: yup
    .number()
    .required()
    .integer(),
  currentSpeed: yup
    .number()
    .required()
    .integer(),
  jamExprTime: yup
    .number()
    .required()
    .min(3)
    .max(6),
  rumExprTime: yup
    .number()
    .required()
    .min(1)
    .max(8),
  mode: yup
    .number()
    .required()
    .min(0)
    .max(2)
});

const RollerSettingForm = props => {
  const { isSubmitting } = props;
  const [settings, setSettings] = useState(defaultValue);
  return (
    <div>
      <Formik
        initialValues={defaultValue}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
          setSettings({ ...settings, ...values });
        }}
        validationSchema={validator}
      >
        {({ errors, touched }) => (
          <Form className="form-inline">
            <label for="eoz">End of Zone (true=1 false=0) : </label>
            <Field name="eoz" type="number" />
            <ErrorMessage name="eoz" component={ErrorDiv} />
            <label for="pe">Photo eye (clear=1 block=0) : </label>
            <Field name="pe" type="number" />
            <ErrorMessage name="pe" component={ErrorDiv} />
            <label for="halfSpeed">Half speed (enable=1 disable=0): </label>
            <Field name="halfSpeed" type="number" />
            <ErrorMessage name="halfSpeed" component={ErrorDiv} />
            <label for="speed">Char speed: </label>
            <Field name="speed" type="number" />
            <ErrorMessage name="speed" component={ErrorDiv} />
            <label for="currentSpeed">Char current speed: </label>
            <Field name="currentSpeed" type="number" />
            <ErrorMessage name="currentSpeed" component={ErrorDiv} />

            <label for="jamExprTime">
              JAM timer expiration time (3~6 sec):{" "}
            </label>
            <Field name="jamExprTime" type="number" min={3} max={6} />
            <ErrorMessage name="jamExprTime" component={ErrorDiv} />
            <label for="rumExprTime">
              Run timer expiration time (1~8 sec):{" "}
            </label>
            <Field name="rumExprTime" type="number" min={1} max={8} />
            <ErrorMessage name="rumExprTime" component={ErrorDiv} />
            <label for="mode">Mode: </label>
            <Field name="mode" component="select">
              <option value={0}>Singulate</option>
              <option value={1}>Slug</option>
              <option value={2}>LongBox</option>
            </Field>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
      <pre>{JSON.stringify(settings, 0, 2)}</pre>
    </div>
  );
};

export default RollerSettingForm;
