// @flow
import React from "react";

import { Modal, Tabs } from "antd";
import "./NetworkingSettings.less";

import NetworkingSettingForm from "components/form/NetworkingSettingForm";
import RollerSettingForm from "components/form/RollerSettingForm";

const { TabPane } = Tabs;

/**
 * Setting roller
 * @param {*} props ={rollerSettings, visible, onCancel, onValueChanged }
 */
const RollerSettingDialog = props => {
  const {
    rollerSettings,
    visible,
    onCancel,
    onNetworkingChanged,
    onRollerSettingsChanged
  } = props;

  return (
    <Modal
      visible={visible}
      title="Roller settings"
      okText="Ok"
      style={{ width: "80%" }}
      footer={null}
      onCancel={onCancel}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Roller Settings" key="1">
          <RollerSettingForm
            onCancel={onCancel}
            onValueChanged={onRollerSettingsChanged}
          />
        </TabPane>
        <TabPane tab="Networking Settings" key="2">
          <NetworkingSettingForm
            onValueChanged={onNetworkingChanged}
            onCancel={onCancel}
            rollerSettings={rollerSettings}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default RollerSettingDialog;
