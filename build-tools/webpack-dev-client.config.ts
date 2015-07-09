import WebpackConfig = require('./WebpackConfig');

var config = WebpackConfig.makeBase();

config.entry = [
    './client/main.ts'
];

config.output = {
    filename: 'raml-doc.js',
    path: WebpackConfig.getPath('build'),
    publicPath: '/'
};

config.plugins = WebpackConfig.getPlugins({
    environment: 'development',
    nodeSourceMaps: false,
    hotReload: false,
    minify: false
});

config.devtool = "#source-map";

export = config;
