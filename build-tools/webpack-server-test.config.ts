/// <reference path="../typings/references.d.ts" />

import fs = require('fs');
import walkSync = require('walk-sync');
import path = require('path');
import minimist = require('minimist');
import WebpackConfig = require('./WebpackConfig');

function collectExternals(): WebpackConfig.Externals {
    var externals: WebpackConfig.Externals = {};

    fs.readdirSync('./node_modules')
        .filter((x: string): boolean => ['.bin'].indexOf(x) === -1)
        .forEach((mod: string): void => {
            externals[mod] = 'commonjs ' + mod;
        });

    return externals;
}

function matches(name: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern: RegExp) => !!name.match(pattern));
}


class EntriesCollector {
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

    collect(): WebpackConfig.EntriesObject {
        var entries: WebpackConfig.EntriesObject = {};

        walkSync(this.dirname).forEach((filename: string) => {
            var absFileName = path.resolve(WebpackConfig.PROJECT_ROOT, path.join(this.dirname, filename));

            if (this.isEntryPoint(filename)) {
                var entryPointName = absFileName.replace(WebpackConfig.PROJECT_ROOT + path.sep, '').replace(/.ts$/, '');
                entries[entryPointName] = absFileName;
            }
        });
        return entries;
    }
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

var x = WebpackConfig.makeConfig({
    environment: 'testing',
    entry: new EntriesCollector('./server', includes).collect(),
    outputDir: 'test-build',
    externals: collectExternals(),
    hotReload: false,
    sourceMaps: "#source-map",
    minify: false,
    longTermCaching: false,
    debug: true,
    assetsDir: 'assets',
    generateIndexHTML: false,
    nodeSourceMaps: true
});

export = x;