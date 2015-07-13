export interface CompilerOptions {
    charset?: string;
    codepage?: number;
    declaration?: boolean;
    diagnostics?: boolean;
    emitBOM?: boolean;
    listFiles?: boolean;
    locale?: string;
    mapRoot?: string;
    module?: string;
    noEmit?: boolean;
    noEmitOnError?: boolean;
    noImplicitAny?: boolean;
    noLib?: boolean;
    noLibCheck?: boolean;
    noResolve?: boolean;
    out?: string;
    outDir?: string;
    preserveConstEnums?: boolean;
    removeComments?: boolean;
    sourceMap?: boolean;
    sourceRoot?: string;
    suppressImplicitAnyIndexErrors?: boolean;
    target?: string;
    watch?: boolean;
    newLine?: string;
    noEmitHelpers?: boolean;
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    emitDecoratorMetadata?: boolean;
    isolatedModules?: boolean;
    experimentalDecorators?: boolean;
}

export interface Config {
    compilerOptions: CompilerOptions;
    files: string[];
}

