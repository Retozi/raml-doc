
/// <reference path="../webpack/webpack.d.ts" />

declare module "webpack-dev-server" {
    import webpack = require("webpack");

    class WebpackDevServer {
        constructor(webpack: webpack.Compiler, opts: webpackDevServer.Options)
        listen(port: number, host: string, callback: Function): void
    }
    export = WebpackDevServer;
}

declare module webpackDevServer {
    interface Stats {
        colors: boolean;
    }
    interface Options {
        contentBase: string;
        hot: boolean;
        quiet: boolean;
        publicPath: string;
        stats: Stats;
    }
}