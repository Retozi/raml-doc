import TsConfig = require('./TsConfig');
var config: TsConfig.Config = {
    compilerOptions: {
        target: "es5",
        module: "commonjs",
        sourceMap: true,
        noImplicitAny: true,
        outDir: "./test-build"
    },
    files: [
        './server/RamlSpec_test.ts'
    ]
};

export = config;
