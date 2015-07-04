/// <reference path="./typings/references.d.ts" />

import walkSync = require('walk-sync');
import Linter = require('tslint');
import fs = require('fs');
import path = require('path');
var errorCount = 0;
var fileWithErrorsCount = 0;
var fileCount = 0;

function lintFile(fileName: string) {
    var configuration = require('./tslint.json');
    var options: tslint.ILinterOptions = {
        configuration: configuration,
        formatter: 'prose',
        rulesDirectory: null,
        formattersDirectory: null
    };
    var linter = new Linter(fileName, fs.readFileSync(fileName, 'utf8'), options);
    return linter.lint();
}

function lintDir(dirName: string): void {
    walkSync(dirName).forEach((fileName: string): void => {
        fileName = path.resolve(__dirname, dirName, fileName);
        if (fileName.match(/.*\.ts$/)) {
            var res = lintFile(fileName);
            if (res.failureCount > 0) {
                console.log('tslint ' + fileName + ': ' + (res.failureCount + ' errors:'));
            }
            fileCount++;
            if (res.failureCount > 0) {
                console.log(res.output);
                errorCount += res.failureCount;
                fileWithErrorsCount++;
            }
        }
    });
}

process.argv.slice(2).forEach(function(dirName): void {
    lintDir(dirName);
});

console.log(`tslint: ${errorCount} errors total. ${fileCount} files total, ${fileWithErrorsCount} have errors.`);

if (errorCount > 0) {
    throw Error('there are linting errors')
}
