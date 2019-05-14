import React from "react";
import FileReader from "components/FileReader";
import AjaxTest from "components/tests/AjaxTest";

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
    key: "rollerSettingRouter__filereader",
    name: "Test",
    to: "/rollerSettingsTest",
    component: FileReader
  },
  {
    key: "rollerSettingRouter__ajaxtest",
    name: "Fetch test",
    to: "/fetchtest",
    component: AjaxTest
  }
];
