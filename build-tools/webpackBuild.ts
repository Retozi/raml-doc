/// <reference path="../typings/references.d.ts" />

import webpack = require('webpack');
import os = require('os');

var EOL = os.EOL;

var targets: {[idx: string]: string} = {
    'test-server': './webpack-test-server.config.ts',
    'prod-server': './webpack-prod-server.config.ts'
};

var target = process.argv.slice(2)[0];

if (typeof targets[target] === 'undefined') {
    throw new Error('target ' + target + ' is not defined');
}

var webpackConfig = require(targets[target]);

function failBuild(msg: string): void {
    console.error('build failed');
    throw new Error(msg);
}

function handleErrors(errors: string[]): void {
    failBuild(errors.reduce((msg: string, error: string) => msg + '[ERROR] ' + error + EOL, ''));
}

function handleWarnings(warnings: string[]): void {
    warnings.forEach((failure: string) => console.warn('[WARNING] ' + failure));
}

function runCompiler(config: Object): void {
    /* tslint:disable */
    console.log(config);
    /* tslint:enable */
    var compiler = webpack(config);

    compiler.run(function(err: webpack.Error, stats: webpack.Stats): void {
        var jsonStats = stats.toJson();

        if (err) {
            var msg = err.stack;

            if (err.details) {
                msg += err.details;
            }
            failBuild(msg);
        }

        if (jsonStats.errors.length > 0) {
            return handleErrors(jsonStats.errors);
        }

        if (jsonStats.warnings.length > 0) {
            handleWarnings(jsonStats.warnings);
        }
        /* tslint:disable */
        console.log('build successful. build hash: ' + jsonStats.hash);
        /* tslint:enable */
    });
}

runCompiler(webpackConfig);
