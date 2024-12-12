const { merge } = require('webpack-merge');
const path = require('path');
const SRC_DIR = path.resolve(__dirname, 'src');
const baseConfig = require('./webpack.base.js');
const prodConfig = require('./webpack.prod.js');
const devConfig = require('./webpack.dev.js');

module.exports = (env, argv) => {
  switch (argv.mode) {
    case 'development':
      var config = merge(baseConfig, devConfig);
      break;
    case 'production':
      var config = merge(baseConfig, prodConfig);
      break;
    default:
      throw new Error('No matching configuration was found!');
  }
  // Create config2 for klaro-no-translations.
  let config2 = {
    ...config,
    entry: {
      'klaro-no-translations': path.join(SRC_DIR, 'klaro-no-translations.js'),
    },
    output: {
      ...config.output,
      library: 'klaro',
    }
  };
  return [config, config2];
};