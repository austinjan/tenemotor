import React, { useState } from "react";
import {
  Form,
  Input,
  Tooltip,
  Icon,
  Radio,
  Row,
  Col,
  Checkbox,
  Button
} from "antd";
import MonacoEditor from "react-monaco-editor";

const AjaxTest = props => {
  const { getFieldDecorator } = props.form;

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 }
    }
  };

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0
      },
      sm: {
        span: 16,
        offset: 8
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
    });
  };

  const makeNormalizedEvent = e => {
    return e;
  };

  const editorDidMount = (editor, monaco) => {
    editor.focus();
  };

  return (
    <div>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <Form.Item label="Host">
          {getFieldDecorator("Host", {
            rules: [
              {
                type: "url",
                message: "The input is not valid url!"
              },
              {
                required: true,
                message: "Please input host url"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Method">
          {getFieldDecorator("Method", { initialValue: "GET" })(
            <Radio.Group>
              <Radio.Button value="GET">GET</Radio.Button>
              <Radio.Button value="PUT">PUT</Radio.Button>
              <Radio.Button value="POST">POST</Radio.Button>
              <Radio.Button value="DELETE">DELETE</Radio.Button>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="Body">
          {getFieldDecorator("Body", {
            getValueFromEvent: makeNormalizedEvent,

            initialValue: "{}"
          })(
            <MonacoEditor
              language="json"
              height="400"
              width="400"
              theme="vs-dark"
              editorDidMount={editorDidMount}
            />
          )}
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const WrappedAjaxTest = Form.create({
  name: "ajaxtest"
})(AjaxTest);

export default WrappedAjaxTest;
