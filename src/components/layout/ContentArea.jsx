import React from "react";
import { AlertProvider } from "components/alertutils";
import { makeRollerSettingRouters } from "routers";

const contentArea = () => {
  return (
    <div>
      <AlertProvider>{makeRollerSettingRouters}</AlertProvider>
    </div>
  );
};

export default contentArea;
