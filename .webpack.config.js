// define child rescript

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
module.exports = config => {
  config.target = "electron-renderer";
  config.plugins = [
    new MonacoWebpackPlugin({ languages: ["json"] }),
    ...config.plugins
  ];

  return config;
};
