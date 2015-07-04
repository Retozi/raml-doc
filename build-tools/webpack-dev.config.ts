import WebpackConfig = require('./WebpackConfig');

export = WebpackConfig.makeConfig({
    environment: 'development',
    hotReload: true,
    sourceMaps: "#source-map",
    minify: false,
    longTermCaching: false,
    debug: true,
    assetsDir: 'assets',
    generateIndexHTML: false
});
