declare module "html-webpack-plugin" {
    interface Options {
        template: string;
    }

    class HtmlWebpackPlugin{
        constructor(opts: Options)
    }

    export = HtmlWebpackPlugin;
}