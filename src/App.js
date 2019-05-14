import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "components/layout/Sidebar";
import ContentArea from "components/layout/ContentArea";

import "./App.css";

const { Sider, Content } = Layout;

const App = props => {
  const [appSettings, setAppSettings] = useState({
    collapsed: false
  });

  const handleAppSettings = {
    setCollapsed(c) {
      setAppSettings(preSettings => ({ ...preSettings, collapsed: c }));
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          breakpoint="sm"
          onBreakpoint={broken => {
            console.log(broken);
          }}
          className="app__side"
          collapsible
          onCollapse={handleAppSettings.setCollapsed}
          collapsed={appSettings.collapsed}
        >
          <Sidebar />
        </Sider>

        <Content className="app__content">
          <ContentArea />
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
