const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  addWebpackModuleRule({
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          modules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]'
          }
        }
      },
      'postcss-loader'
    ]
  })
); 