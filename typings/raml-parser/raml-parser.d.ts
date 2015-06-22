/// <reference path="../q/Q.d.ts" />

declare module 'raml-parser' {
    import Q = require('q');

    export function loadFile(path: string): Q.Promise<Raml>;

    export interface NamedParameter {
        displayName: string;
        description: string;
        type: string;
        enum: any[];
        pattern: string;
        minLength: number;
        maxLength: number;
        minimum: number;
        maximum: number;
        example: string;
        repeat: boolean;
        required: boolean;
        default: string;
    }

    export interface NamedParameters {
        [idx: string]: NamedParameter;
    }

    export interface Response {
        description: string;
        body: Body;
        headers: NamedParameters;
    }

    export interface Responses {
        [idx: string]: Response;
    }

    export interface Body {
        'application/json': {
            schema?: string;
            example?: string;
        }
    }

    export interface Method {
        description: string;
        securedBy: string[];
        displayName: string;
        headers: NamedParameters;
        queryParameters: NamedParameters;
        responses: Responses;
        protocols: string[];
        method: string;
        is: string[];
        body: Body;
    }

    export interface Resource {
        displayName: string;
        description: string;
        relativeUri: string;
        methods: Method[];
        relativeUriPathSegments: string[];
        resources: Resource[];
    }

    export interface BaseUriParameter {
        description: string;
    }

    export interface BaseUriParameters {
        [idx: string]: BaseUriParameter;
    }

    export interface SecurityScheme {
        description?: string;
        type: string;
        settings?: {[idx: string]: string};
    }

    export interface SecuritySchemes {
        [idx: string]: SecurityScheme
    }

    export interface Documentation {
        title: string;
        content: string;
    }

    export interface Schema {
        [idx: string]: string;
    }

    interface Trait {
        [idx: string]: Method;
    }

    interface ResourceType {
        [idx: string]: Resource
    }

    export interface Raml {
        title: string;
        version: string;
        baseUri: string;
        baseUriParameters?: BaseUriParameters;
        protocols: string[];
        mediaType: string;
        documentation: Documentation[];
        schemas: Schema[];
        securitySchemes: SecurityScheme[];
        traits: Trait[];
        resourceTypes: ResourceType[];
        resources: Resource[];
    }

}