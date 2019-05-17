import React, { useState, useEffect } from "react";
import { Form, Input, Button, InputNumber } from "antd";
import CodeEditor from "components/CodeEditor";
const electron = require("electron");
const dgram = electron.remote.require("dgram");
const UdpTest = props => {
  const [settings, setSettings] = useState({
    url: "192.168.33.177",
    data: '{"hello":"udp"}',
    port: 5566
  });
  const { getFieldDecorator } = props.form;

  const sendData = () => {
    const client = dgram.createSocket("udp4");
    client.send(settings.data, settings.port, settings.url, err => {
      if (err) {
        console.log("udp send err: ", err);
      }
      console.log("udp send data...", settings);
      client.close();
    });
  };

  useEffect(() => {
    console.log("use effect", settings);
  }, [settings]);
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log("submit: ", values);
        setSettings(values);

        sendData();
      }
    });
  };
  return (
    <div>
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Form.Item label="URL">
          {getFieldDecorator("url", { initialValue: settings.url })(<Input />)}
        </Form.Item>
        <Form.Item label="Port">
          {getFieldDecorator("port", { initialValue: settings.port })(
            <InputNumber />
          )}
        </Form.Item>
        <Form.Item label="Data">
          {getFieldDecorator("data", {
            initialValue: settings.data
          })(
            <CodeEditor
              language="json"
              height="300"
              width="400"
              theme="vs-dark"
            />
          )}
        </Form.Item>
        <Button htmlType="submit"> Send </Button>
      </Form>
    </div>
  );
};

const UDPTestForm = Form.create({
  name: "udp_test_form"
})(UdpTest);

export default UDPTestForm;
