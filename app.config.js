// app.config.js
module.exports = ({ config }) => ({
  ...config,                                     // bring in all existing config keys
  plugins: (config.plugins || [])                // start from existing plugins array
    .filter((p) =>                             
      // plugins entries can be strings or [name, options]
      (typeof p === 'string' ? p : p[0]) !== 'expo-device'
    ),
});
