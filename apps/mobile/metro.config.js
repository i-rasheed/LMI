const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const originalResolveRequest = config.resolver.resolveRequest;
const nodeModuleShims = {
  '@supabase/node-fetch': path.resolve(__dirname, 'src/shims/node-fetch.js'),
  ws: path.resolve(__dirname, 'src/shims/ws.js'),
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...nodeModuleShims,
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName in nodeModuleShims) {
    return {
      type: 'sourceFile',
      filePath: nodeModuleShims[moduleName],
    };
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
