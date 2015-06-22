var walkSync = require('walk-sync');
var Linter = require('tslint');
var fs = require('fs');
var path = require('path');
var errorCount = 0;
var fileWithErrorsCount = 0;
var fileCount = 0;

function lintFile(fileName) {
    var configuration = require('./tslint.json');
    var options = {
        configuration: configuration,
        formatter: 'prose',
        rulesDirectory: null,
        formattersDirectory: null
    };
    var linter = new Linter(fileName, fs.readFileSync(fileName, 'utf8'), options);
    return linter.lint();
}

function lintDir(dirName) {
    walkSync(dirName).forEach(function(fileName) {
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

process.argv.slice(2).forEach(function(dirName) {
    lintDir(dirName);
});

console.log('tslint: ' + errorCount + ' errors total. ' + fileCount + ' files total, ' + fileWithErrorsCount + ' have errors.');

if (errorCount > 0) {
    throw Error('there are linting errors')
}
