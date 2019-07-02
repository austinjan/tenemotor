import React from "react";
import StyleGuide from "components/tests/StyleGuide";
import AjaxTest from "components/tests/AjaxTest";
import MessageTest from "components/tests/MessageTest";
import RollerControl from "components/tests/RollerControl";
import RxjsTesting from "components/tests/RsjsTesting";
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
    key: "rollerSettingRouter__MessageTest",
    name: "Roller message test",
    to: "/MessageTest",
    component: MessageTest
  },
  {
    key: "rollerSettingRouter__rollerControl",
    name: "Roller control",
    to: "/rollercontrol",
    component: RollerControl
  },
  {
    key: "rollerSettingRouter__rxjstesting",
    name: "RxJS testing",
    to: "/rxjstesting",
    component: RxjsTesting
  }
];
