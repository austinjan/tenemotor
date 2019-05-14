import React from "react";
import { Route } from "react-router-dom";
import { rollerSettingRouter } from "./RollerSettingRouter";
export { rollerSettingRouter } from "./RollerSettingRouter";

const PrivateRoute = ({ component: Component, ...rest }) => {
  return <Route {...rest} component={Component} />;
};

export const makeRollerSettingRouters = rollerSettingRouter.map(item => (
  <PrivateRoute
    path={item.to}
    component={item.component}
    to={item.to}
    key={item.key}
  />
));

// export const makeMonitorRouters = monitorRouters.map(item => (
//   <PrivateRoute
//     path={item.to}
//     component={item.component}
//     to={item.to}
//     key={item.key.toString()}
//   />
// ));
