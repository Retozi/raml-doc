/// <reference path="../typings/references.d.ts" />

import fs = require('fs');
import path = require('path');
import minimist = require('minimist');
import WebpackConfig = require('./WebpackConfig');
import webpack = require('webpack');

function collectExternals(): webpack.Externals {
    var externals: webpack.Externals = {};

    fs.readdirSync('./node_modules')
        .filter((x: string): boolean => ['.bin'].indexOf(x) === -1)
        .forEach((mod: string): void => {
            externals[mod] = 'commonjs ' + mod;
        });

    return externals;
}


function getIncludePatterns(options: minimist.ParsedArgs): RegExp[] {
    /* tslint:disable */
    var patterns = options['g'];
    /* tslint:enable */
    if (patterns !== undefined) {
        var ptrns = Array.isArray(patterns) ? <string[]> patterns : [<string> patterns];
        return ptrns.map((p: string) => new RegExp(p));
    }
    return undefined;
}

var includes = getIncludePatterns(minimist(process.argv.slice(2)));

var config = WebpackConfig.makeBase();

config.entry = new WebpackConfig.TestEntriesCollector('./server', includes).collect();

config.output = {
    path: path.join(WebpackConfig.PROJECT_ROOT, 'test-build'),
    filename: '[name].js',
    publicPath: '/'
};

config.plugins = WebpackConfig.getPlugins({
    environment: 'testing',
    nodeSourceMaps: true,
    hotReload: false,
    minify: false
});

config.devtool = "#source-map"
config.externals = collectExternals();
export = config;