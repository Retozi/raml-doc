import WebpackConfig = require('./WebpackConfig');
import path = require('path');

var config = WebpackConfig.makeBase();

config.entry = {
    'RamlSpec': 'server/RamlSpec.ts',
    'Server': 'server/Server.ts'
}

config.output = {
    path: WebpackConfig.getPath('build'),
    filename: '[name].js',
}

config.plugins = WebpackConfig.getPlugins({
    environment: 'production',
    nodeSourceMaps: false,
    hotReload: false,
    minify: true
});

export = config;