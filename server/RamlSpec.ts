/// <reference path="../typings/references.d.ts" />
import raml = require('raml-parser');
import yaml = require('js-yaml');
import JsonschemaDefaults = require('./JsonschemaDefaults');
import validator = require('is-my-json-valid');
import _ = require('lodash');

interface JsonBody {
        schema?: string;
        example?: string;
        parsedSchema?: ParsedSchema;
        parsedExample?: ParsedExample;
}

export type NamedParameters = raml.NamedParameters;
export type NamedParameter = raml.NamedParameter;

export function emptyJsonBody(): JsonBody {
    return {
        schema: null,
        example: null,
        parsedSchema: new ParsedSchema(null),
        parsedExample: new ParsedExample(null)
    };
}

export interface Body {
    'application/json': JsonBody;
}

export interface Response extends raml.Response {
    body: Body;
}

export interface Responses {
    [idx: string]: Response;
}

export interface Method extends raml.Method {
    body: Body;
    responses: Responses;
}

export interface Resource extends raml.Resource {
    absoluteUri: string;
    methods: Method[];
    resources: Resource[];
}

export type Documentation = raml.Documentation;

export interface Raml extends raml.Raml {
    parsedSchemas: GlobalTypes;
    resources: Resource[];
}

enum ParseType {yaml = 1, json}

class ParseError {
    type: ParseType;
    error: Error;
    constructor(type: ParseType, error: Error) {
        this.type = type;
        this.error = error;
    }

    toMessage(): string {
        return `${ParseType[this.type]} parsing error: ${this.error.message}`;
    }
}

class ParseResult {
    result: Object;
    error: ParseError;
    constructor(result: Object, error: ParseError) {
        this.result = result;
        this.error = error;
    }
}


export class ParsedSchema extends ParseResult {
    constructor(schemaStr: string) {
        schemaStr = schemaStr || null;
        if (!schemaStr) {
            super(null, null);
            return;
        }
        var result: Object = null;
        var error: ParseError = null;

        try {
            result = (schemaStr) ? yaml.load(schemaStr) : null;
            JsonschemaDefaults.addDefaults(result);
        } catch (e) {
            error = new ParseError(ParseType.yaml, e);
        }
        super(result, error);
    }
}

export class ParsedExample extends ParseResult {
    constructor(exampleStr: string) {
        var result: Object = null;
        var error: ParseError = null;
        try {
            result = (exampleStr) ? JSON.parse(exampleStr) : null;
        } catch (e) {
            error = new ParseError(ParseType.json, e);
        }
        super(result, error);
    }
}

export interface GlobalTypes {
    [idx: string]: Object;
}


// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj: raml.Raml): GlobalTypes {
    var types: GlobalTypes = {};
    if (!ramlObj.schemas) {
        return null;
    }
    ramlObj.schemas.forEach((s: raml.Schema): void => {
        Object.keys(s).forEach((t: string): void => {
            var schema: Object;
            try {
                schema = yaml.load(s[t]);
            }
            catch (e) {
                throw new Error(`global Types could not b parsed, ${e.message}`)
            }
            JsonschemaDefaults.addDefaults(schema);
            types[t] = schema;
        });
    });
    return types;
}




class Route {
    url: string;
    methods: Method[];
    constructor(url: string, methods: Method[]) {
        this.url = url;
        this.methods = methods;
    }
}

interface ResourceContaining {
    resources: Resource[];
}



class RamlEnhancer {
    data: Raml;
    globalTypes: GlobalTypes;
    routes: Route[];
    constructor(data: raml.Raml) {
        this.data = <Raml> data;
        this.data.parsedSchemas = parseGlobalTypes(data);
        this.routes = [];
        // cast data as enhanced Raml,
        this.walk(this.data, '');
    }

    private registerRoute(url: string, methods: Method[]): void {
        if (methods) {
            this.routes.push(new Route(url, methods));
        }
    }

    private enhanceBody(body: Body): void {
        if (!body) {
            return;
        }
        var appJson = body['application/json'];
        appJson.parsedSchema = new ParsedSchema(appJson.schema);
        appJson.parsedExample = new ParsedExample(appJson.example);
    }

    private enhanceMethod(method: Method): void {
        this.enhanceBody(method.body);
        if (method.responses) {
            Object.keys(method.responses).forEach((status: string) => {
                this.enhanceBody(method.responses[status].body);
            });
        }
    }

    private enhanceResource(r: Resource, parentUrl: string): void {
        r.absoluteUri = parentUrl + r.relativeUri;
        if (r.methods) {
            r.methods.forEach((m: Method) => this.enhanceMethod(m));
            this.registerRoute(r.absoluteUri, r.methods);
        }
        this.walk(r, r.absoluteUri);
    }

    private walk(node: ResourceContaining, parentUrl: string): void {
        if (!node.resources) {
            return;
        }
        node.resources.forEach((r: Resource) => this.enhanceResource(r, parentUrl));
    }
}


export class RamlSpec {
    private data: raml.Raml;
    private _routes: Route[];

    constructor(data: raml.Raml) {
        var enhancer = new RamlEnhancer(data);
        this._routes = enhancer.routes;
        this.data = data;
    }

    getData(): Raml {
        return <Raml> this.data;
    }

    getRoutes(): Route[] {
        return this._routes;
    }

    getMethods(path: string): Method[] {
        if (path[0] !== '/') {
            path = "/" + path;
        }

        var route = _.find(this._routes, (r: Route) => r.url === path);

        if (route) {
            return route.methods || [];
        } else {
            return [];
        }
    }
    getMethod(path: string, methodName: string): Method {
        methodName = methodName.toLowerCase();
        var methods = this.getMethods(path);
        return _.find(methods, (m: Method) => m.method === methodName);
    }

    extractResponseJsonBody(path: string, methodName: string, status: string): JsonBody {
        var method = this.getMethod(path, methodName);
        // along the way, you could always run into undefined...
        if (method && method.responses[status] && method.responses[status].body) {
            return method.responses[status].body['application/json'] || emptyJsonBody();
        }
        return emptyJsonBody();
    }

    extractPayloadJsonBody(path: string, methodName: string): JsonBody {
        var method = this.getMethod(path, methodName);
        if (method && method.body) {
            return method.body['application/json'] || emptyJsonBody();
        }
        return emptyJsonBody();
    }
}

function validate(schema: Object, example: Object, globs?: GlobalTypes): validator.Error[] {
    var g: validator.Globals;
    if (globs) {
        g = {schemas: globs};
    }

    var v = validator(schema, g);
    v(example);
    return v.errors || [];
};


export interface ValidationError {
    url: string;
    method: string;
    status: string;
    message: string;
}

export class ParseErrors {
    errors: ValidationError[];
    globalTypes: GlobalTypes;
    constructor(globalTypes?: GlobalTypes) {
        this.globalTypes = globalTypes;
        this.errors = [];
    }
    private registerError(url: string, methodName: string, status: string, message: string): void {
        this.errors.push({
            url: url,
            method: methodName,
            status: status || null,
            message: message
        });
    }
    registerErrors(url: string, methodName: string, status: string, body: JsonBody): void {
        if (body.parsedSchema.error) {
            this.registerError(url, methodName, status, body.parsedSchema.error.toMessage());
        }
        if (body.parsedExample.error) {
            this.registerError(url, methodName, status, body.parsedExample.error.toMessage());
        }
        if (body.parsedSchema.result && body.parsedExample.result) {
            var errors = validate(body.parsedSchema.result, body.parsedExample.result, this.globalTypes);
            errors.forEach((e: validator.Error) => {
                this.registerError(url, methodName, status, `${e.field}: ${e.message}`);
            });
        }
    }
}


export class Validator {
    spec: RamlSpec;
    parseErrors: ParseErrors;
    constructor(spec: RamlSpec) {
        this.spec = spec;
        this.parseErrors = new ParseErrors(this.spec.getData().parsedSchemas);
    }
    validate(): ValidationError[] {
        this.spec.getRoutes().forEach((r: Route) => {
            this.validateRoute(r);
        });
        return this.parseErrors.errors;
    }

    private validateRoute(r: Route): void {
        r.methods.forEach((method: Method) => {
            this.validatePayload(r.url, method.method);
            Object.keys(method.responses || {}).forEach((status: string) => {
                this.validateResponse(r.url, method.method, status);
            });
        });
    }

    private validatePayload(url: string, methodName: string): void {
        var body = this.spec.extractPayloadJsonBody(url, methodName);
        this.parseErrors.registerErrors(url, methodName, null, body);
    }

    private validateResponse(url: string, methodName: string, status: string): void {
        var body = this.spec.extractResponseJsonBody(url, methodName, status);
        this.parseErrors.registerErrors(url, methodName, status, body);
    }
}

export function loadAsync(path: string): Q.Promise<RamlSpec> {
    return raml.loadFile(path)
        .then(function(data: raml.Raml): RamlSpec {
            return new RamlSpec(data);
        });
}

