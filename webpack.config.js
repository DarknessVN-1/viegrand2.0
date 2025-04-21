const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add or extend resolve.alias
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // Core React Native → react-native-web
    'react-native': 'react-native-web',
    // Native WebView → Web implementation
    'react-native-webview': 'react-native-web-webview',
  };

  return config;
};
