/// <reference path="../typings/references.d.ts" />

import webpack = require("webpack");
import walkSync = require('walk-sync');
import path = require('path');
import fs = require('fs');

export var PROJECT_ROOT = path.dirname(__dirname);

interface PluginConfig {
    environment: string;
    nodeSourceMaps: boolean;
    hotReload: boolean;
    minify: boolean;
}

function matches(name: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern: RegExp) => !!name.match(pattern));
}

export class TestEntriesCollector {
    private dirname: string;
    private includes: RegExp[];
    private excludes: RegExp[];

    constructor(dirname: string, includes?: RegExp[], excludes?: RegExp[]) {
        this.dirname = dirname;
        this.includes = includes;
        this.excludes = excludes || [];
    }

    private isEntryPoint(filename: string): boolean {
        return (
            filename.match(/_test.ts$/) &&
            !matches(filename, this.excludes) &&
            (this.includes === undefined || matches(filename, this.includes))
        );
    }

    collect(): webpack.EntriesObject {
        var entries: webpack.EntriesObject = {};

        walkSync(this.dirname).forEach((filename: string) => {
            var absFileName = path.resolve(PROJECT_ROOT, path.join(this.dirname, filename));

            if (this.isEntryPoint(filename)) {
                var entryPointName = absFileName.replace(PROJECT_ROOT + path.sep, '').replace(/.ts$/, '');
                entries[entryPointName] = absFileName;
            }
        });
        return entries;
    }
}

export function getPath(relativeDir: string): string {
    return path.join(PROJECT_ROOT, relativeDir);
}

export function getPlugins(options: PluginConfig): any[] {
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
    return plugins;
}

export function collectNodeModules(): webpack.Externals {
    var externals: webpack.Externals = {};

    fs.readdirSync('./node_modules')
        .filter((x: string): boolean => ['.bin'].indexOf(x) === -1)
        .forEach((mod: string): void => {
            externals[mod] = 'commonjs ' + mod;
        });

    return externals;
}


export function makeBase(): webpack.Config {
    return {
        entry: null,
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'awesome-typescript-loader?noImplicitAny=true'
                },
                {
                    test: /\.styl$/,
                    loader: "style!css!autoprefixer!stylus?paths=./client/styl"
                },
                {test: /\.css$/, loader: "style!css!autoprefixer"},
                {test: /\.(otf|eot|svg|ttf|woff)/, loader: "url-loader?limit=8192"}
            ]
        },
        resolve: {
            extensions: ["", ".js", '.ts']
        }
    };
}
