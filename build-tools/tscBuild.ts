/// <reference path="../typings/references.d.ts" />

import child_process = require('child_process');
import TsConfig = require('./TsConfig');

var targets: {[idx: string]: string} = {
    'test-server': './tsconfig-test-server.ts',
    'prod-server': './tsconfig-prod-server.ts'
};

var target = process.argv.slice(2)[0];

if (typeof targets[target] === 'undefined') {
    throw new Error('target ' + target + ' is not defined');
}

function configToCmd(config: TsConfig.Config): string {
    var args: string[] = ['node ./node_modules/typescript/bin/tsc.js'];
    Object.keys(config.compilerOptions).forEach((key: string): void => {
        var val = (<any> config.compilerOptions)[key];
        if (typeof val === "boolean") {
            if (val) {
                args.push(`--${key}`);
            }
        } else {
            args.push(`--${key} ${(<any> config.compilerOptions)[key]}`);
        }
    });

    config.files.forEach((f: string) => args.push(f));
    return args.join(' ');
}

try {
    var out = child_process.execSync(configToCmd(require(targets[target])));
} catch(e) {
    console.log(e.stdout.toString('utf8'));
    throw e;
}
console.log((<any> out).toString('utf8'));