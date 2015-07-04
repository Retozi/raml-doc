/// <reference path="../typings/references.d.ts" />

import webpack = require("webpack");
import HtmlWebpackPlugin = require('html-webpack-plugin');
import path = require('path');

export var PROJECT_ROOT = path.dirname(__dirname);

export interface EntriesObject {
    [idx: string]: string;
}

export interface Externals {
    [idx: string]: string
}

export interface Options {
    entry?: string[] | EntriesObject;
    nodeSourceMaps?: boolean;
    environment?: string;
    hotReload?: boolean;
    minify?: boolean;
    longTermCaching: boolean;
    outputDir?: string;
    assetsDir?: string;
    generateIndexHTML?: boolean;
    externals?: Externals;
    sourceMaps?: string;
}

function getOutputDir(options: Options): string {
    if (options.outputDir) {
        return options.outputDir;
    }
    var baseDir = 'build';
    return options.assetsDir ? path.join(baseDir, options.assetsDir) : baseDir;
}

function getFilename(options: Options) {
    if (options.entry) {
        return '[name].js';
    }
    return 'bundle' + (options.longTermCaching ? '-[hash]' : '') + '.js';
}

function getEntry(options: Options): string[] | Object {
    if (options.entry) {
        return options.entry;
    }
    var entry = ["./parkingcard-app/src/main.ts"];

    // prepend dev server if hotReload is enabled
    if (options.hotReload) {
        entry.unshift("webpack/hot/dev-server");
        entry.unshift("webpack-dev-server/client?https://localhost:8081");
    }
    return entry;
}

function getPlugins(options: Options): any[] {
    var plugins: any[] = [];

    if (options.nodeSourceMaps) {
        plugins.push(
            new webpack.BannerPlugin('require("source-map-support").install();', { raw: true, entryOnly: false })
        );
    }

    if (options.hotReload) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(options.environment)
        }
    }));

    if (options.minify) {
        plugins.push(new webpack.optimize.DedupePlugin());
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    if (options.generateIndexHTML) {
        plugins.push(new HtmlWebpackPlugin({
            template: path.resolve('parkingcard-app/index.html')
        }));
    }

    return plugins;
}


export function makeConfig(options: Options): Object {
    return {
        entry: getEntry(options),
        output: {
            path: path.join(PROJECT_ROOT, getOutputDir(options)),
            filename: getFilename(options),
            publicPath: '/' + (options.assetsDir ? options.assetsDir + '/' : '')
        },
        externals: options.externals,
        plugins: getPlugins(options),
        devtool: options.sourceMaps || null,
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'awesome-typescript-loader?noImplicitAny=true'
                },
                {
                    test: /\.styl$/,
                    loader: "style!css!autoprefixer!stylus?paths=./pc-ui/md/styl"
                },
                {test: /\.css$/, loader: "style!css!autoprefixer"},
                {test: /\.(otf|eot|svg|ttf|woff)/, loader: "url-loader?limit=8192"}
            ]
        },
        resolve: {
            extensions: ["", ".js", '.ts']
        }
    };
};
