"use strict";
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./makeWebpackConfig')('dev');
var devServer = require('./server/server');

var server = new WebpackDevServer(webpack(config), {
    // webpack-dev-server options
    contentBase: __dirname,

    hot: true,
    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
    // Use "webpack/hot/dev-server" as additional module in your entry point

    // webpack-dev-middleware options
    quiet: false,
    noInfo: false,
    publicPath: "/",

    stats: { colors: true }
});

server.listen(8080, "localhost", function() {});

// lets fire up a dev server
devServer({source: './assets/api.raml'}).listen(8081);
