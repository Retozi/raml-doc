import TsConfig = require('./TsConfig');
var config: TsConfig.Config = {
    compilerOptions: {
        target: "es5",
        module: "commonjs",
        sourceMap: false,
        noImplicitAny: true,
        outDir: "./build"
    },
    files: [
        './server/RamlSpec.ts',
        './server/Server.ts'
    ]
};

export = config;
