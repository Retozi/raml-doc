

declare module "walk-sync" {
    function walkSync(baseDir: string, relativePath?: string): string[];
    export = walkSync;
}