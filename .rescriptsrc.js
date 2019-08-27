module.exports = [
  require.resolve("./.webpack.config.js"),

  [
    "use-babel-config",
    {
      presets: ["react-app", ["@babel/preset-flow", { all: true }]],
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
