/// <reference path="../typings/references.d.ts" />

import raml = require('raml-parser');
import CSON = require('cson-parser');
var terseJsonschema = require('terse-jsonschema');
import validator = require('is-my-json-valid');
import _ = require('lodash');

interface JsonBody {
        schema?: string;
        example?: string;
        parsedSchema?: ParsedSchema;
        parsedExample?: ParsedExample;
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


class ParsedSchema extends ParseResult {
    constructor(schemaStr: string, globalTypes?: GlobalTypes) {
        schemaStr = schemaStr || null;
        var result: Object = null;
        var error: ParseError = null;
        var schema: Object = null;
        try {
            schema = CSON.parse(schemaStr);
        } catch(e) {
            error = new ParseError(ParseType.cson, e);
        }
        if (!error) {
            try {
                result = terseJsonschema.parse(schema, globalTypes)
            } catch(e) {
                error = new ParseError(ParseType.terseJson, e);
            }
        }
        super(result, error);
    }
}

class ParsedExample extends ParseResult {
    constructor(exampleStr: string) {
        var result: Object = null;
        var error: ParseError = null;
        try {
            result = JSON.parse(exampleStr);
        } catch(e) {
            error = new ParseError(ParseType.json, e);
        }
        super(result, error);
    }
}

interface GlobalTypes {
    [idx: string]: Object;
}


// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj: raml.Raml): GlobalTypes {
    var types: GlobalTypes = {};
    if (!ramlObj.schemas) {
        return null;
    }
    ramlObj.schemas.forEach((s: raml.Schema): void => {
        Object.keys(s).forEach((t: string):void => {
            types[t] = CSON.parse(s[t]);
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
        var appJson = body['application/json'];
        appJson.parsedSchema = new ParsedSchema(appJson.schema, this.globalTypes);
        appJson.parsedExample = new ParsedExample(appJson.example);
    }

    private enhanceMethod(method: Method) {
        if (method.body) {
            this.enhanceBody(method.body);
        }
        if (method.responses) {
            Object.keys(method.responses).forEach((status: string) => {
                this.enhanceBody(method.responses[status].body);
            })
        }
    }

    private enhanceResource(r: Resource, parentUrl: string) {
        r.absoluteUri = parentUrl + r.relativeUri;
        r.methods.forEach((m: Method) => this.enhanceMethod(m));
        this.registerRoute(r.absoluteUri, r.methods);
        this.walk(r, r.absoluteUri);
    }

    private walk(node: ResourceContaining, parentUrl: string) {
        if (!node.resources) {
            return;
        }
        node.resources.forEach((r: Resource) => this.enhanceResource(r, parentUrl));
    }
}


class RamlSpec {
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

    extractResponseSchema(path: string, method: string, status: string) {
        return this.extractResponseJsonBody(path, method, status).parsedSchema;
    }

    extractResponseExample(path: string, method: string, status: string) {
        return this.extractResponseJsonBody(path, method, status).parsedExample;
    }

    extractPayloadSchema(path: string, method: string) {
        return this.extractPayloadJsonDef(path, method).parsedSchema;
    }

    extractPayloadExample(path: string, method: string) {
        return this.extractPayloadJsonDef(path, method).parsedExample;
    }

    getMethods(path: string): Method[] {
        if (path[0] !== '/') {
            path = "/" + path;
        }
        var pathRegex = "^" + path.replace('/', '\/') + "$";
        pathRegex = pathRegex.replace(/\{[\w]+\}/, "[^\/]+");
    
        var pathRegexObj = new RegExp(pathRegex);

        var route = _.find(this._routes, (r: Route) => pathRegexObj.test(r.url));
    
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

    private extractResponseJsonBody(path: string, methodName: string, status: string): JsonBody {
        var method = this.getMethod(path, methodName);
        // along the way, you could always run into undefined...
        if (method && method.responses[status] && method.responses[status].body) {
            return method.responses[status].body['application/json'] || {};
        }
        return {}
    }

    private extractPayloadJsonDef(path: string, methodName: string): JsonBody {
        var method = this.getMethod(path, methodName);
        if (method && method.body) {
            return method.body['application/json'] || {};
        }
        return {};
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

class Validator {
    spec: RamlSpec;
    errors: ValidationError[];
    constructor(spec: RamlSpec) {
        this.spec = spec;
        this.errors = [];
    }
    validate(): ValidationError[] {
        this.spec.getRoutes().forEach((r: Route) => {
            this.validateRoute(r);
        });
        return this.errors;
    }

    private registerError(url: string, methodName: string, status: string, message: string) {
        this.errors.push({
            url: url,
            method: methodName,
            status: status || null,
            message: message
        });
    }

    private validateRoute(r: Route): void {
        r.methods.forEach((method: Method) => {
            this.validatePayload(r.url, method.method);
            Object.keys(method.responses).forEach((status: string) => {
                this.validateResponse(r.url, method.method, status);
            })
        });
    }

    private registerErrors(
        url: string,
        methodName: string,
        status: string,
        schema: ParseResult,
        example: ParseResult
    ): void {
        if (schema.error) {
            this.registerError(url, methodName, status, schema.error.toMessage());
        }
        if (example.error) {
            this.registerError(url, methodName, status, example.error.toMessage());
        }
        if (schema.result && schema.error) {
            
        }
    }

    private validatePayload(url: string, methodName: string) {
        var schema = this.spec.extractPayloadSchema(url, methodName);
        var example = this.spec.extractPayloadSchema(url, methodName);
        this.registerErrors(url, methodName, status, schema, example);
    }

    private validateResponse(url: string, methodName: string, status: string) {
        var schema = this.spec.extractResponseSchema(url, methodName, status);
        var example = this.spec.extractResponseSchema(url, methodName, status);
        this.registerErrors(url, methodName, status, schema, example);
    }
}

export function loadAsync(path: string) {
    return raml.loadFile(path)
        .then(function(data: raml.Raml) {
            return new RamlSpec(data);
        });
}

