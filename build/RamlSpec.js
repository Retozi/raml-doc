var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/references.d.ts" />
var raml = require('raml-parser');
var yaml = require('js-yaml');
var JsonschemaDefaults = require('./JsonschemaDefaults');
var validator = require('is-my-json-valid');
var _ = require('lodash');
function emptyJsonBody() {
    return {
        schema: null,
        example: null,
        parsedSchema: new ParsedSchema(null),
        parsedExample: new ParsedExample(null)
    };
}
exports.emptyJsonBody = emptyJsonBody;
var ParseType;
(function (ParseType) {
    ParseType[ParseType["yaml"] = 1] = "yaml";
    ParseType[ParseType["json"] = 2] = "json";
})(ParseType || (ParseType = {}));
var ParseError = (function () {
    function ParseError(type, error) {
        this.type = type;
        this.error = error;
    }
    ParseError.prototype.toMessage = function () {
        return ParseType[this.type] + " parsing error: " + this.error.message;
    };
    return ParseError;
})();
var ParseResult = (function () {
    function ParseResult(result, error) {
        this.result = result;
        this.error = error;
    }
    return ParseResult;
})();
var ParsedSchema = (function (_super) {
    __extends(ParsedSchema, _super);
    function ParsedSchema(schemaStr) {
        schemaStr = schemaStr || null;
        if (!schemaStr) {
            _super.call(this, null, null);
            return;
        }
        var result = null;
        var error = null;
        try {
            result = (schemaStr) ? yaml.load(schemaStr) : null;
            JsonschemaDefaults.addDefaults(result);
        }
        catch (e) {
            error = new ParseError(ParseType.yaml, e);
        }
        _super.call(this, result, error);
    }
    return ParsedSchema;
})(ParseResult);
exports.ParsedSchema = ParsedSchema;
var ParsedExample = (function (_super) {
    __extends(ParsedExample, _super);
    function ParsedExample(exampleStr) {
        var result = null;
        var error = null;
        try {
            result = (exampleStr) ? JSON.parse(exampleStr) : null;
        }
        catch (e) {
            error = new ParseError(ParseType.json, e);
        }
        _super.call(this, result, error);
    }
    return ParsedExample;
})(ParseResult);
exports.ParsedExample = ParsedExample;
// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj) {
    var types = {};
    if (!ramlObj.schemas) {
        return null;
    }
    ramlObj.schemas.forEach(function (s) {
        Object.keys(s).forEach(function (t) {
            var schema;
            try {
                schema = yaml.load(s[t]);
            }
            catch (e) {
                throw new Error("global Types could not b parsed, " + e.message);
            }
            JsonschemaDefaults.addDefaults(schema);
            types[t] = schema;
        });
    });
    return types;
}
var Route = (function () {
    function Route(url, methods) {
        this.url = url;
        this.methods = methods;
    }
    return Route;
})();
var RamlEnhancer = (function () {
    function RamlEnhancer(data) {
        this.data = data;
        this.data.parsedSchemas = parseGlobalTypes(data);
        this.routes = [];
        // cast data as enhanced Raml,
        this.walk(this.data, '');
    }
    RamlEnhancer.prototype.registerRoute = function (url, methods) {
        if (methods) {
            this.routes.push(new Route(url, methods));
        }
    };
    RamlEnhancer.prototype.enhanceBody = function (body) {
        if (!body) {
            return;
        }
        var appJson = body['application/json'];
        appJson.parsedSchema = new ParsedSchema(appJson.schema);
        appJson.parsedExample = new ParsedExample(appJson.example);
    };
    RamlEnhancer.prototype.enhanceMethod = function (method) {
        var _this = this;
        this.enhanceBody(method.body);
        if (method.responses) {
            Object.keys(method.responses).forEach(function (status) {
                _this.enhanceBody(method.responses[status].body);
            });
        }
    };
    RamlEnhancer.prototype.enhanceResource = function (r, parentUrl) {
        var _this = this;
        r.absoluteUri = parentUrl + r.relativeUri;
        if (r.methods) {
            r.methods.forEach(function (m) { return _this.enhanceMethod(m); });
            this.registerRoute(r.absoluteUri, r.methods);
        }
        this.walk(r, r.absoluteUri);
    };
    RamlEnhancer.prototype.walk = function (node, parentUrl) {
        var _this = this;
        if (!node.resources) {
            return;
        }
        node.resources.forEach(function (r) { return _this.enhanceResource(r, parentUrl); });
    };
    return RamlEnhancer;
})();
var RamlSpec = (function () {
    function RamlSpec(data) {
        var enhancer = new RamlEnhancer(data);
        this._routes = enhancer.routes;
        this.data = data;
    }
    RamlSpec.prototype.getData = function () {
        return this.data;
    };
    RamlSpec.prototype.getRoutes = function () {
        return this._routes;
    };
    RamlSpec.prototype.getMethods = function (path) {
        if (path[0] !== '/') {
            path = "/" + path;
        }
        var route = _.find(this._routes, function (r) { return r.url === path; });
        if (route) {
            return route.methods || [];
        }
        else {
            return [];
        }
    };
    RamlSpec.prototype.getMethod = function (path, methodName) {
        methodName = methodName.toLowerCase();
        var methods = this.getMethods(path);
        return _.find(methods, function (m) { return m.method === methodName; });
    };
    RamlSpec.prototype.extractResponseJsonBody = function (path, methodName, status) {
        var method = this.getMethod(path, methodName);
        // along the way, you could always run into undefined...
        if (method && method.responses[status] && method.responses[status].body) {
            return method.responses[status].body['application/json'] || emptyJsonBody();
        }
        return emptyJsonBody();
    };
    RamlSpec.prototype.extractPayloadJsonBody = function (path, methodName) {
        var method = this.getMethod(path, methodName);
        if (method && method.body) {
            return method.body['application/json'] || emptyJsonBody();
        }
        return emptyJsonBody();
    };
    return RamlSpec;
})();
exports.RamlSpec = RamlSpec;
function validate(schema, example, globs) {
    var g;
    if (globs) {
        g = { schemas: globs };
    }
    var v = validator(schema, g);
    v(example);
    return v.errors || [];
}
;
var ParseErrors = (function () {
    function ParseErrors(globalTypes) {
        this.globalTypes = globalTypes;
        this.errors = [];
    }
    ParseErrors.prototype.registerError = function (url, methodName, status, message) {
        this.errors.push({
            url: url,
            method: methodName,
            status: status || null,
            message: message
        });
    };
    ParseErrors.prototype.registerErrors = function (url, methodName, status, body) {
        var _this = this;
        if (body.parsedSchema.error) {
            this.registerError(url, methodName, status, body.parsedSchema.error.toMessage());
        }
        if (body.parsedExample.error) {
            this.registerError(url, methodName, status, body.parsedExample.error.toMessage());
        }
        if (body.parsedSchema.result && body.parsedExample.result) {
            var errors = validate(body.parsedSchema.result, body.parsedExample.result, this.globalTypes);
            errors.forEach(function (e) {
                _this.registerError(url, methodName, status, e.field + ": " + e.message);
            });
        }
    };
    return ParseErrors;
})();
exports.ParseErrors = ParseErrors;
var Validator = (function () {
    function Validator(spec) {
        this.spec = spec;
        this.parseErrors = new ParseErrors(this.spec.getData().parsedSchemas);
    }
    Validator.prototype.validate = function () {
        var _this = this;
        this.spec.getRoutes().forEach(function (r) {
            _this.validateRoute(r);
        });
        return this.parseErrors.errors;
    };
    Validator.prototype.validateRoute = function (r) {
        var _this = this;
        r.methods.forEach(function (method) {
            _this.validatePayload(r.url, method.method);
            Object.keys(method.responses || {}).forEach(function (status) {
                _this.validateResponse(r.url, method.method, status);
            });
        });
    };
    Validator.prototype.validatePayload = function (url, methodName) {
        var body = this.spec.extractPayloadJsonBody(url, methodName);
        this.parseErrors.registerErrors(url, methodName, null, body);
    };
    Validator.prototype.validateResponse = function (url, methodName, status) {
        var body = this.spec.extractResponseJsonBody(url, methodName, status);
        this.parseErrors.registerErrors(url, methodName, status, body);
    };
    return Validator;
})();
exports.Validator = Validator;
function loadAsync(path) {
    return raml.loadFile(path)
        .then(function (data) {
        return new RamlSpec(data);
    });
}
exports.loadAsync = loadAsync;
