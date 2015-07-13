declare module tslint  {
    interface LintResult {
        failureCount: number;
        format: string;
        output: string;
    }
    interface ILinterOptions {
        configuration: any;
        formatter: string;
        formattersDirectory: string;
        rulesDirectory: string;
    }
}
declare module "tslint" {
    class Linter {
        private fileName;
        private source;
        private options;
        static VERSION: string;
        constructor(fileName: string, source: string, options: tslint.ILinterOptions);
        lint(): tslint.LintResult;
        private getRelativePath(directory);
        private containsRule(rules, rule);
    }

    export = Linter;
}
