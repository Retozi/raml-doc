
declare module "webpack" {
    interface Compiler {
        run(cb: (err: webpack.Error, stats: webpack.Stats) => void): void;

    }
    function webpack(opts: any): Compiler;

    module webpack {
        interface Error {
            stack: string;
            details: string;
        }
        interface Stats {
            hasErrors(): boolean;
            hasWarnings(): boolean;
            toJson(options?: Object): JsonStats
        }

        interface JsonStats {
            errors: string[];
            warnings: string[];
            hash: string;
        }
        interface Loader {
            request: string;
            path: string;
            query: string;
        }

        interface LoaderContext {
            version: number;
            context: string;
            request: string;
            query: string;
            data: Object;
            loaders: Array<Loader>;
            loaderIndex: number;
            resource: string;
            resourcePath: string;
            resourceQuery: string;
            values: Array<any>;
            inputValues: Array<any>;

            options: Object;
            debug: boolean;
            minimize: boolean;
            target: string;
            webpack: boolean;

            async(flag?: boolean): void;
            cacheable(flag?: boolean): void;
            emitError(message: string): void;
            emitWarning(message: string): void;
            exec(code: string, filename: string): void;
            resolve(context: string, request: string, callback: (err: Object, result: string) => void): void;
            resolveSync(context: string, request: string): string;
            addDependency(file: string): void;
            dependency(file: string): void;
            addContextDependency(directory: string): void;
            clearDependencies(): void;
            emitFile(name: string, content: string, sourceMap?: Object): void;
            emitFile(name: string, content: NodeBuffer, sourceMap?: Object): void;
            callback(error: any, content?: string, sourceMap?: Object): void;
            callback(error: any, content?: NodeBuffer, sourceMap?: Object): void;
        }

        interface SourceMap {
            version: number;
            sources: string[];
            sourcesContent?: string[];
            names: string[];
            mappings: string;
            file?: string;
            sourceRoot?: string;
        }

        class HotModuleReplacementPlugin {}

        interface BannerPluginOptions {
            raw: boolean;
            entryOnly: boolean;

        }
        class BannerPlugin {
            constructor(code: string, options: BannerPluginOptions)
        }

        class DefinePlugin {
            constructor(vars: Object)
        }


        module optimize {
            class DedupePlugin {}
            class UglifyJsPlugin {}
        }
    }
    export = webpack;
}
