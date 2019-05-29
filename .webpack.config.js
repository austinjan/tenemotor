// define child rescript

// const { edit, getPaths } = require("@rescripts/utilities");

// const matcher = inQuestion => inQuestion.module && inQuestion.module.rules;

// const transform = match => ({
//   ...match,
//   module: {
//     ...match.module,
//     rules: [
//       {
//         test: /\.less$/,
//         use: [
//           require.resolve("style-loader"), // creates style nodes from JS strings

//           {
//             loader: require.resolve("css-loader"), // translates CSS into CommonJS
//             options: {
//               importLoadeers: 1
//             }
//           },
//           {
//             loader: require.resolve("less-loader") // compiles Less to CSS
//           }
//         ]
//       },
//       ...match.module.rules
//     ]
//   }
// });

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
module.exports = config => {
  const newConfig = config;

  newConfig.target = "electron-renderer";
  newConfig.plugins = [
    new MonacoWebpackPlugin({ languages: ["json"] }),
    ...newConfig.plugins
  ];

  let rule = newConfig.module.rules.find(rule => rule.oneOf);

  rule.oneOf.unshift({
    test: /\.less$/,
    use: [
      {
        loader: "style-loader"
      },
      {
        loader: "css-loader"
      },
      {
        loader: "less-loader",
        options: {
          javascriptEnabled: true
        }
      }
    ]
  });

  return newConfig;

  //return config;
};
