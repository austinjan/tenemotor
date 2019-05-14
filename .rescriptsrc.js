const logConfig = config => {
  console.log(config);
  return config;
};

logConfig.isMiddleware = true;

module.exports = [
  require.resolve("./.webpack.config.js"),

  [
    "use-babel-config",
    {
      presets: ["react-app"],
      plugins: [
        [
          "import",
          {
            libraryName: "antd",
            libraryDirectory: "es",
            style: "css" // true for less
          }
        ]
      ]
    }
  ]
];
