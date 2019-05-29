import React from "react";
import StyleGuide from "components/tests/StyleGuide";
import AjaxTest from "components/tests/AjaxTest";
import UdpTest from "components/tests/UdpTest";
import RollerControl from "components/tests/RollerControl";

export const rollerSettingRouter = [
  {
    key: "rollerSettingRouter__settings",
    name: "Settings",
    to: "/rollerSettings",
    icon: "setting",
    component: () => (
      <div>
        <h1>roller settings</h1>
      </div>
    )
  },
  {
    key: "rollerSettingRouter__styleGuide",
    name: "Style guide",
    to: "/rollerStyleGuide",
    component: StyleGuide
  },
  {
    key: "rollerSettingRouter__ajaxtest",
    name: "Fetch test",
    to: "/fetchtest",
    component: AjaxTest
  },
  {
    key: "rollerSettingRouter__udpclientTest",
    name: "Udp client test",
    to: "/udpClientTest",
    component: UdpTest
  },
  {
    key: "rollerSettingRouter__rollerControl",
    name: "Roller control",
    to: "/rollercontrol",
    component: RollerControl
  }
];
