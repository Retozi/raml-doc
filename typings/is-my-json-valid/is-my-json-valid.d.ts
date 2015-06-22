declare module 'is-my-json-valid' {
    export = validator;

    function validator(schema: Object): validator.Validate;

    module validator {
        export interface Validate {
            (json: Object): Object[];
            errors: Object[];
        }
    }
}