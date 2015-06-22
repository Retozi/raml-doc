declare module 'is-my-json-valid' {
    export = validator;

    function validator(schema: Object): validator.Validate;

    module validator {
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