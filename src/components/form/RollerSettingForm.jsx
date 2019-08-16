import { Checkbox } from "antd";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import mergeLeft from "ramda/src/mergeLeft";
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
  mode: 0, //Mode selection {Singulate, Slug, LongBox,...}
  forceNeighborIP: 0,
  upperIP: "",
  lowerIP: "",
  eeyeTCPEvent: 0, //disable=0 enable=1
  hostIP: ""
};

const ErrorDiv = props => (
  <div className="entire_row" style={{ color: "red" }}>
    {props.children}
  </div>
);

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
    .max(2),
  forceNeighborIP: yup
    .number()
    .required()
    .min(0)
    .max(1),
  upperIP: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  lowerIP: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  hostIP: yup
    .string()
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid ip address."),
  eeyeTCPEvent: yup
    .number()
    .required()
    .min(0)
    .max(1)
});

type tProps = {
  onCancel: Function,
  onValueChanged: Function,
  rollerSetting: tRoller
};

const RollerSettingForm = (props: tProps) => {
  const { onCancel, onValueChanged, rollerSetting } = props;
  const temp = rollerSetting && rollerSetting.rollerSettings;
  const _settings = mergeLeft(temp, defaultValue);
  const [settings, setSettings] = useState(_settings);
  const [showNeiborIPSettings, setShowNeiborIPSettings] = useState(
    _settings.forceNeighborIP === 1
  );
  const [showHostIPSettings, setShowHostIPSettings] = useState(
    _settings.eeyeTCPEvent === 1
  );

  return (
    <div>
      <Formik
        initialValues={_settings}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
          setSettings({ ...settings, ...values });
          onValueChanged({ ...settings, ...values });
        }}
        validationSchema={validator}
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form className="form-inline">
            <label>End of Zone : </label>
            <Field name="eoz" type="number" component="select">
              <option value={0}>False</option>
              <option value={1}>True</option>
            </Field>
            <ErrorMessage name="eoz" component={ErrorDiv} />

            <label htmlFor="pe">Photo eye : </label>
            <Field name="pe" type="number" component="select">
              <option value={0}>Block</option>
              <option value={1}>Clear</option>
            </Field>
            <ErrorMessage
              className="entire_row"
              name="pe"
              component={ErrorDiv}
            />

            <label htmlFor="halfSpeed">Half speed : </label>
            <Field name="halfSpeed" type="number" component="select">
              <option value={0}>Disable</option>
              <option value={1}>Enable</option>
            </Field>
            <ErrorMessage name="halfSpeed" component={ErrorDiv} />

            <label htmlFor="speed">Char speed: </label>
            <Field name="speed" type="number" />
            <ErrorMessage name="speed" component={ErrorDiv} />

            <label htmlFor="currentSpeed">Char current speed: </label>
            <Field name="currentSpeed" type="number" />
            <ErrorMessage name="currentSpeed" component={ErrorDiv} />

            <label htmlFor="jamExprTime">
              JAM timer expiration time (3~6 sec):{" "}
            </label>
            <Field name="jamExprTime" type="number" min={3} max={6} />
            <ErrorMessage name="jamExprTime" component={ErrorDiv} />

            <label htmlFor="rumExprTime">
              Run timer expiration time (1~8 sec):{" "}
            </label>
            <Field name="rumExprTime" type="number" min={1} max={8} />
            <ErrorMessage name="rumExprTime" component={ErrorDiv} />

            <label htmlFor="mode">Mode: </label>
            <Field name="mode" component="select">
              <option value={0}>Singulate</option>
              <option value={1}>Slug</option>
              <option value={2}>LongBox</option>
            </Field>

            <Checkbox
              checked={values.forceNeighborIP}
              onChange={event => {
                setFieldValue("forceNeighborIP", event.target.checked ? 1 : 0);
                setShowNeiborIPSettings(event.target.checked);
              }}
            >
              Manual Set neighbor IP
            </Checkbox>

            {showNeiborIPSettings ? (
              <>
                <label htmlFor="upperIP">Upper roller IP:</label>
                <Field name="upperIP" type="text" />
                <ErrorMessage name="upperIP" component={ErrorDiv} />
                <label htmlFor="lowerIP">Lower roller IP:</label>
                <Field name="lowerIP" type="text" />
                <ErrorMessage name="lowerIP" component={ErrorDiv} />
              </>
            ) : null}

            <Checkbox
              checked={values.eeyeTCPEvent}
              onChange={event => {
                setFieldValue("eeyeTCPEvent", event.target.checked ? 1 : 0);
                setShowHostIPSettings(event.target.checked);
              }}
            >
              Enable e-eye tcp event
            </Checkbox>

            {showHostIPSettings ? (
              <>
                <label htmlFor="hostIP">Event destination: </label>
                <Field name="hostIP" type="text" />
                <ErrorMessage name="hostIP" component={ErrorDiv} />
              </>
            ) : null}

            <button onClick={onCancel} className="btn_cancel">
              Cancel
            </button>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
      <pre>{JSON.stringify(settings, 0, 2)}</pre>
    </div>
  );
};

export default RollerSettingForm;
