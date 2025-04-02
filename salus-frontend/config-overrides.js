const { override, addWebpackAlias, addPostcssPlugins, adjustStyleLoaders } = require('customize-cra');
const path = require('path');

module.exports = override(
  // Aggiungiamo alias per facilitare le importazioni
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@styles': path.resolve(__dirname, 'src/styles'),
    '@assets': path.resolve(__dirname, 'src/assets')
  }),
  
  // Aggiungiamo plugin PostCSS per migliorare il supporto cross-browser
  addPostcssPlugins([
    require('autoprefixer'),
    require('postcss-flexbugs-fixes')
  ]),
  
  // Configura correttamente i loader di stile
  adjustStyleLoaders(({ use }) => {
    if (use && use.length > 0) {
      const cssLoader = use.find(loader => loader.loader && loader.loader.includes('css-loader'));
      if (cssLoader) {
        cssLoader.options = {
          ...cssLoader.options,
          url: true,
          import: true,
          modules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]'
          }
        };
      }
    }
  })
); 