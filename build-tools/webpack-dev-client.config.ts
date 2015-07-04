import WebpackConfig = require('./WebpackConfig');

var config = WebpackConfig.makeBase();

config.entry = [
    './client/main.ts',
    "webpack/hot/dev-server",
    "webpack-dev-server/client?https://localhost:8081"
]

config.output = {
    filename: 'raml-doc.js',
    path: WebpackConfig.getPath('build'),
    publicPath: '/'
}

config.plugins = WebpackConfig.getPlugins({
    environment: 'development',
    nodeSourceMaps: false,
    hotReload: true,
    minify: false
});

config.devtool = "#source-map";

export = config;