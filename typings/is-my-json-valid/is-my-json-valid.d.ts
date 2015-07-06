declare module 'is-my-json-valid' {
    export = validator;

    function validator(schema: Object, globs: validator.Globals): validator.Validate;

    module validator {
        export interface Globals {
            schemas: Object;
        }
        export interface Error {
            field: string;
            message: string;
        }
        export interface Validate {
            (json: any): Error[];
            errors: Error[];
        }
    }
}