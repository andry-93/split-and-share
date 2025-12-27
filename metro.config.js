const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer = {
    ...config.transformer,
    unstable_allowRequireContext: true,
};

config.resolver.alias = {
    '@': path.resolve(__dirname, 'src'),
};

module.exports = config;
