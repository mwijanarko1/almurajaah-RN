const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');
config.resolver.assetExts.push('wasm');

// Remove 'wasm' from sourceExts if present to ensure it's treated as an asset
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'wasm');

module.exports = config;
