"use strict";
var webpack = require('webpack');

function getEntry(type) {
    var entry = ['./src/main.jsx'];
    //if dev then prepend dev server for autoreload
    if (type === 'dev') {
        entry.unshift('webpack/hot/dev-server');
        entry.unshift('webpack-dev-server/client?http://localhost:8080');
    }
    return entry;
}

function getPlugins(type) {
    var plugins = [];
    if (type === 'dev') {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    } else if (type === 'prod') {
        plugins.push(new webpack.optimize.DedupePlugin());
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }
    return plugins;
}

function getJsxLoaders(type) {
    var loaders = ['jsx?harmony'];
    if (type === 'dev') {
        loaders.unshift('react-hot');
    }
    return loaders;
}

module.exports = function(type) {
    return {
        entry: getEntry(type),
        output: {
            path: __dirname + '/build',
            filename: 'raml-doc.js',
            publicPath: "/"
        },
        plugins: getPlugins(type),
        devtool: (type === 'dev') ? "#inline-source-map" : null,
        module: {
            loaders: [
                { test: /\.js.{0,1}$/, loaders: getJsxLoaders(type) },
                { test: /\.styl$/, loader: "style!css!autoprefixer!stylus?paths=styl"},
                { test: /\.css$/, loader: "style!css!autoprefixer"},
                { test: /\.(otf|eot|svg|ttf|woff)/, loader: 'url-loader?limit=8192'}
            ],
        },
        node: {
          fs: "empty",
          path: "empty"
        },
        resolve: {
            extensions: ['', '.js', '.jsx']
        }
    };
};
