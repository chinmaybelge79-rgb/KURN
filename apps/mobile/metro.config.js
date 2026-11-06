const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Expo Router imports query-string from its compiled package. pnpm's strict
// workspace layout does not hoist that package into the router package, so
// map it explicitly for Metro on web and native.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'query-string': path.resolve(projectRoot, 'node_modules/query-string'),
};

module.exports = config;
