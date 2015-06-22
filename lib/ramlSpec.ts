/// <reference path="../typings/references.d.ts" />
import raml = require('raml-parser');
import CSON = require('cson-parser');
import TerseJsonschema = require('./terseJsonschema');
import validator = require('is-my-json-valid');
import _ = require('lodash');

interface JsonBody {
        schema?: string;
        example?: string;
        parsedSchema?: ParsedSchema;
        parsedExample?: ParsedExample;
}

export function emptyJsonBody(): JsonBody {
    return {
        schema: null,
        example: null,
        parsedSchema: new ParsedSchema(null, null),
        parsedExample: new ParsedExample(null)
    }
}

interface Body {
    'application/json': JsonBody;
}

interface Response extends raml.Response {
    body: Body;
}

interface Responses {
    [idx: string]: Response;
}

interface Method extends raml.Method {
    body: Body;
    responses: Responses;
}

interface Resource extends raml.Resource {
    absoluteUri: string;
    methods: Method[];
    resources: Resource[];
}

interface Raml extends raml.Raml {
    resources: Resource[];
}

enum ParseType {cson=1, json, terseJson, yaml}

class ParseError {
    type: ParseType;
    error: Error;
    constructor(type: ParseType, error: Error) {
        this.type = type;
        this.error = error;
    }

    toMessage(): string {
        return `${ParseType[this.type]} parsing error: ${this.error.message}`
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
    constructor(schemaStr: string, globalTypes?: GlobalTypes) {
        schemaStr = schemaStr || null;
        var result: Object = null;
        var error: ParseError = null;
        var schema: Object = null;
        try {
            schema = (schemaStr) ? CSON.parse(schemaStr): null;
        } catch(e) {
            error = new ParseError(ParseType.cson, e);
        }
        if (!error && schema) {
            try {
                result = TerseJsonschema.parse(<TerseJsonschema.Node> schema, globalTypes)
            } catch(e) {
                error = new ParseError(ParseType.terseJson, e);
            }
        }
        super(result, error);
    }
}

export class ParsedExample extends ParseResult {
    constructor(exampleStr: string) {
        var result: Object = null;
        var error: ParseError = null;
        try {
            result = (exampleStr) ? JSON.parse(exampleStr): null;
        } catch(e) {
            error = new ParseError(ParseType.json, e);
        }
        super(result, error);
    }
}

interface GlobalTypes {
    [idx: string]: TerseJsonschema.Node;
}


// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj: raml.Raml): GlobalTypes {
    var types: GlobalTypes = {};
    if (!ramlObj.schemas) {
        return null;
    }
    ramlObj.schemas.forEach((s: raml.Schema): void => {
        Object.keys(s).forEach((t: string): void => {
            types[t] = <TerseJsonschema.Node> CSON.parse(s[t]);
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
    data: raml.Raml;
    globalTypes: GlobalTypes;
    routes: Route[];
    constructor(data: raml.Raml, globalTypes: GlobalTypes) {
        this.data = data;
        this.globalTypes = globalTypes;
        this.routes = [];
        // cast data as enhanced Raml, 
        this.walk(<Raml> data, '');
    }

    private registerRoute(url: string, methods: Method[]) {
        if (methods) {
            this.routes.push(new Route(url, methods));
        }
    }

    private enhanceBody(body: Body) {
        if (!body) {
            return;
        }
        var appJson = body['application/json'];
        appJson.parsedSchema = new ParsedSchema(appJson.schema, this.globalTypes);
        appJson.parsedExample = new ParsedExample(appJson.example);
    }

    private enhanceMethod(method: Method): void {
        this.enhanceBody(method.body);
        if (method.responses) {
            Object.keys(method.responses).forEach((status: string) => {
                this.enhanceBody(method.responses[status].body);
            })
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
    private _globalTypes: GlobalTypes;
    private _routes: Route[];

    constructor(data: raml.Raml) {
        this._globalTypes = parseGlobalTypes(data);
        var enhancer = new RamlEnhancer(data, this._globalTypes);
        this._routes = enhancer.routes;
        this.data = data;
    }

    getData(): raml.Raml {
        return this.data;
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
        return emptyJsonBody()
    }

    extractPayloadJsonBody(path: string, methodName: string): JsonBody {
        var method = this.getMethod(path, methodName);
        if (method && method.body) {
            return method.body['application/json'] || emptyJsonBody();
        }
        return emptyJsonBody();
    }
}

function validate(schema: Object, example: Object) {
    var v = validator(schema);
    v(example);
    return v.errors || [];
};


interface ValidationError {
    url: string;
    method: string;
    status: string;
    message: string;
}

export class ParseErrors {
    errors: ValidationError[];
    constructor() {
        this.errors = [];
    }
    private registerError(url: string, methodName: string, status: string, message: string) {
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
            var errors = validate(body.parsedSchema.result, body.parsedExample.result);
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
        this.parseErrors = new ParseErrors();
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
            })
        });
    }

    private validatePayload(url: string, methodName: string) {
        var body = this.spec.extractPayloadJsonBody(url, methodName);
        this.parseErrors.registerErrors(url, methodName, null, body);
    }

    private validateResponse(url: string, methodName: string, status: string) {
        var body = this.spec.extractResponseJsonBody(url, methodName, status);
        this.parseErrors.registerErrors(url, methodName, status, body);
    }
}

export function loadAsync(path: string) {
    return raml.loadFile(path)
        .then(function(data: raml.Raml) {
            return new RamlSpec(data);
        });
}

