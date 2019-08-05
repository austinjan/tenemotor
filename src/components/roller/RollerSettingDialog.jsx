// @flow
import React from "react";
import type { tRoller } from "libs/roller/rollerType";
import { Modal, Tabs } from "antd";
// $FlowFixMe
import "./NetworkingSettings.less";

import NetworkingSettingForm from "components/form/NetworkingSettingForm";
import RollerSettingForm from "components/form/RollerSettingForm";

const { TabPane } = Tabs;

type tProps = {
  rollerSettings: tRoller,
  visible: boolean,
  onCancel: Function,
  onNetworkingChanged: Function,
  onRollerSettingsChanged: Function
};
/**
 * Setting roller
 * @param {*} props ={rollerSettings, visible, onCancel, onValueChanged }
 */
const RollerSettingDialog = (props: tProps) => {
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
      width={700}
      footer={null}
      onCancel={onCancel}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Roller Settings" key="1">
          <RollerSettingForm
            rollerSetting={rollerSettings}
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
