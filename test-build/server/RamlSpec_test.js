require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1).install();
	var RamlSpec = __webpack_require__(3);
	var chai = __webpack_require__(2);
	var expect = chai.expect;
	var FILE = './fixture/api.raml';
	describe('RamlSpec', function () {
	    var s;
	    it('should fetch async', function (done) {
	        RamlSpec.loadAsync(FILE)
	            .then(function (data) {
	            s = data;
	            expect(data.getData().version).to.equal('1');
	            done();
	        }).done();
	    });
	    it('returns data', function () {
	        expect(s.getData().version).to.equal('1');
	    });
	    it('returns routes', function () {
	        expect(s.getRoutes().length).to.equal(3);
	    });
	    it('should get Methods', function () {
	        expect(s.getMethods('test2/{id}').length).to.equal(1);
	        expect(s.getMethods('/test2/{id}').length).to.equal(1);
	        expect(s.getMethods('/bla}').length).to.equal(0);
	    });
	    it('should get method', function () {
	        expect(s.getMethod('test2/{id}', 'post')).to.include.keys('displayName');
	        expect(s.getMethod('test2/{id}', 'get')).to.be.not.ok;
	    });
	    it('should extract Payload Json body', function () {
	        var pay = s.extractPayloadJsonBody('test1', 'put');
	        expect(pay.example).to.be.a('string');
	        expect(pay.schema).to.be.a('string');
	        expect(pay.parsedExample.result).to.be.a('object');
	        expect(pay.parsedSchema.result).to.be.a('object');
	    });
	    it('should extract missing Payload Json body gracefully', function () {
	        var empty = RamlSpec.emptyJsonBody();
	        expect(s.extractPayloadJsonBody('test1', 'post')).to.eql(empty);
	        expect(s.extractPayloadJsonBody('test2', 'post')).to.eql(empty);
	    });
	    it('should extract Response Json body', function () {
	        var pay = s.extractResponseJsonBody('test1', 'put', '200');
	        expect(pay.example).to.be.a('string');
	        expect(pay.schema).to.be.a('string');
	        expect(pay.parsedExample.result).to.be.a('object');
	        expect(pay.parsedSchema.result).to.be.a('object');
	    });
	    it('should extract missing Response Json body gracefully', function () {
	        var empty = RamlSpec.emptyJsonBody();
	        expect(s.extractResponseJsonBody('test1', 'post', '200')).to.eql(empty);
	        expect(s.extractResponseJsonBody('test2', 'post', '200')).to.eql(empty);
	    });
	    it('works without global types', function (done) {
	        RamlSpec.loadAsync('./fixture/no-global-types.raml')
	            .then(function (obj) {
	            var m = obj.getMethod('test', 'post');
	            expect(m).be.instanceOf(Object);
	            done();
	        });
	    });
	});
	describe('ParseErrors', function () {
	    it('should parse a json errorr', function () {
	        var errors = new RamlSpec.ParseErrors();
	        var body = RamlSpec.emptyJsonBody();
	        body.parsedExample = new RamlSpec.ParsedExample('{"hello": "world}');
	        errors.registerErrors('url', 'method', 'status', body);
	        expect(errors.errors[0].message).to.equal("json parsing error: Unexpected end of input");
	    });
	    it('should parse a cson error', function () {
	        var errors = new RamlSpec.ParseErrors();
	        var body = RamlSpec.emptyJsonBody();
	        body.parsedExample = new RamlSpec.ParsedSchema("key: 'string");
	        errors.registerErrors('url', 'method', 'status', body);
	        expect(errors.errors[0].message).to.equal("cson parsing error: missing '");
	    });
	    it('should parse a terseJsonschema error', function () {
	        var errors = new RamlSpec.ParseErrors();
	        var body = RamlSpec.emptyJsonBody();
	        body.parsedSchema = new RamlSpec.ParsedSchema("key: 'stri'");
	        errors.registerErrors('url', 'method', 'status', body);
	        expect(errors.errors[0].message).to.equal("terseJson parsing error: Type is not defined: stri");
	    });
	    it('should parse a validation error', function () {
	        var errors = new RamlSpec.ParseErrors();
	        var body = RamlSpec.emptyJsonBody();
	        body.parsedSchema = new RamlSpec.ParsedSchema("key: 'string'");
	        body.parsedExample = new RamlSpec.ParsedExample('{"key": 1}');
	        errors.registerErrors('url', 'method', 'status', body);
	        expect(errors.errors[0].message).to.equal("data.key: is the wrong type");
	    });
	});
	describe('Validator', function () {
	    it('should validate a schema', function (done) {
	        RamlSpec.loadAsync(FILE)
	            .then(function (data) {
	            var validator = new RamlSpec.Validator(data);
	            var errors = validator.validate();
	            expect(errors.length).to.equal(0);
	            done();
	        }).done();
	    });
	});
	//# sourceMappingURL=RamlSpec_test.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("source-map-support");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("chai");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = this.__extends || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    __.prototype = b.prototype;
	    d.prototype = new __();
	};
	/// <reference path="../typings/references.d.ts" />
	var raml = __webpack_require__(5);
	var CSON = __webpack_require__(6);
	var TerseJsonschema = __webpack_require__(4);
	var validator = __webpack_require__(7);
	var _ = __webpack_require__(8);
	function emptyJsonBody() {
	    return {
	        schema: null,
	        example: null,
	        parsedSchema: new ParsedSchema(null, null),
	        parsedExample: new ParsedExample(null)
	    };
	}
	exports.emptyJsonBody = emptyJsonBody;
	var ParseType;
	(function (ParseType) {
	    ParseType[ParseType["cson"] = 1] = "cson";
	    ParseType[ParseType["json"] = 2] = "json";
	    ParseType[ParseType["terseJson"] = 3] = "terseJson";
	    ParseType[ParseType["yaml"] = 4] = "yaml";
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
	    function ParsedSchema(schemaStr, globalTypes) {
	        schemaStr = schemaStr || null;
	        var result = null;
	        var error = null;
	        var schema = null;
	        try {
	            schema = (schemaStr) ? CSON.parse(schemaStr) : null;
	        }
	        catch (e) {
	            error = new ParseError(ParseType.cson, e);
	        }
	        if (!error && schema) {
	            try {
	                result = TerseJsonschema.parse(schema, globalTypes);
	            }
	            catch (e) {
	                error = new ParseError(ParseType.terseJson, e);
	            }
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
	            types[t] = CSON.parse(s[t]);
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
	    function RamlEnhancer(data, globalTypes) {
	        this.data = data;
	        this.globalTypes = globalTypes;
	        this.routes = [];
	        // cast data as enhanced Raml,
	        this.walk(data, '');
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
	        appJson.parsedSchema = new ParsedSchema(appJson.schema, this.globalTypes);
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
	        this._globalTypes = parseGlobalTypes(data);
	        var enhancer = new RamlEnhancer(data, this._globalTypes);
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
	function validate(schema, example) {
	    var v = validator(schema);
	    v(example);
	    return v.errors || [];
	}
	;
	var ParseErrors = (function () {
	    function ParseErrors() {
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
	            var errors = validate(body.parsedSchema.result, body.parsedExample.result);
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
	        this.parseErrors = new ParseErrors();
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
	//# sourceMappingURL=RamlSpec.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../typings/references.d.ts" />
	var _ = __webpack_require__(8);
	function parseNode(source, defs) {
	    if (_.isArray(source)) {
	        return parseArray(source, defs);
	    }
	    if (_.isObject(source)) {
	        var objectSource = source;
	        if (objectSource.$raw) {
	            return objectSource.$raw;
	        }
	        if (objectSource.$oneOf) {
	            return parseOf('oneOf', objectSource, defs);
	        }
	        if (objectSource.$allOf) {
	            return parseOf('allOf', objectSource, defs);
	        }
	        if (objectSource.$anyOf) {
	            return parseOf('anyOf', objectSource, defs);
	        }
	        return parseObject(objectSource, defs);
	    }
	    if (_.isString(source)) {
	        return parseString(source, defs);
	    }
	    throw new Error("Syntax error, does not support " + typeof source + " field");
	}
	function parseOf(type, source, defs) {
	    if (!_.isArray(source['$' + type])) {
	        throw new Error(type + " must be array");
	    }
	    var res = {};
	    res[type] = source['$' + type].map(function (e) {
	        return parseNode(e, defs);
	    });
	    return res;
	}
	function parseString(source, defs) {
	    switch (source) {
	        case "string":
	        case "integer":
	        case "number":
	        case "boolean":
	        case "null":
	            return { type: source };
	        case "date-time":
	        case "email":
	        case "uri":
	            return { type: 'string', format: source };
	        default:
	            if (!defs || !defs[source]) {
	                throw new Error("Type is not defined: " + source);
	            }
	            return parseNode(defs[source]);
	    }
	}
	function parseRequired(source) {
	    var sourceItems = Object.keys(source).filter(function (f) {
	        return f !== '$required';
	    });
	    // if empty required, nothing is required
	    if (source.$required === '') {
	        return [];
	    }
	    // if no required, then everything is required
	    if (!source.$required) {
	        return sourceItems;
	    }
	    if (!_.isString(source.$required)) {
	        throw new Error('$required should be string');
	    }
	    var required = source.$required.split(' ');
	    required.forEach(function (r) {
	        if (sourceItems.indexOf(r) === -1) {
	            throw new Error("Required non-exist field: " + r);
	        }
	    });
	    return required;
	}
	function parseObject(source, defs) {
	    var obj = {
	        type: 'object',
	        properties: {},
	        required: parseRequired(source),
	        additionalProperties: false
	    };
	    Object.keys(source).forEach(function (k) {
	        if (k !== '$required') {
	            obj.properties[k] = parseNode(source[k], defs);
	        }
	    });
	    return obj;
	}
	function parseArray(array, defs) {
	    if (array.length === 0) {
	        throw new Error("array must be length > 0");
	    }
	    if (array.length > 1) {
	        return { enum: array };
	    }
	    return {
	        type: "array",
	        items: parseNode(array[0], defs)
	    };
	}
	exports.parseArray = parseArray;
	function parse(source, defs) {
	    if (_.isArray(source) || _.isObject(source)) {
	        return parseNode(source, defs);
	    }
	    throw new Error('source must be Array or Object');
	}
	exports.parse = parse;
	//# sourceMappingURL=TerseJsonschema.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("raml-parser");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("cson-parser");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("is-my-json-valid");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("lodash");

/***/ }
/******/ ]);
//# sourceMappingURL=RamlSpec_test.js.map