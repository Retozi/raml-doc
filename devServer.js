"use strict";
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./makeWebpackConfig')('dev');
var watch = require("node-watch");
var path = require("path");
var express = require('express');

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


var ramlReloadServer = express().listen(8081);
var io = require('socket.io').listen(ramlReloadServer);

// wath for any changes and render raml
watch('./assets', function(filename) {
    var ext = path.extname(filename);
    if (ext === '.raml') {
        console.log("file changes");
        io.emit("raml");
    }
});
