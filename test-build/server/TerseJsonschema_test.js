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
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../typings/references.d.ts" />
	__webpack_require__(1).install();
	var TerseJsonschema = __webpack_require__(4);
	var chai = __webpack_require__(2);
	var expect = chai.expect;
	describe('Simple 1 level schema', function () {
	    var source = {
	        username: 'string',
	        age: 'integer',
	        verified: 'boolean',
	        gender: ['F', 'M'],
	        weight: 'number',
	        email: 'email',
	        avatarUrl: 'uri',
	        createdAt: 'date-time',
	        empty: 'null'
	    };
	    var obj = TerseJsonschema.parse(source);
	    it('should be a object', function () {
	        expect(obj.type).to.equal('object');
	        expect(obj.properties).to.be.instanceOf(Object);
	    });
	    it('object should have correct string field', function () {
	        expect(obj.properties.username.type).to.equal('string');
	    });
	    it('object should have correct integer field', function () {
	        expect(obj.properties.age.type).to.equal('integer');
	    });
	    it('object should have correct number field', function () {
	        expect(obj.properties.weight.type).to.equal('number');
	    });
	    it('object should have correct boolean field', function () {
	        expect(obj.properties.verified.type).to.equal('boolean');
	    });
	    it('object should have correct enum field', function () {
	        var field = obj.properties.gender;
	        expect(field.enum).to.have.length(2);
	        expect(field.enum).to.include('F');
	        expect(field.enum).to.include('M');
	    });
	    it('object should have correct date field', function () {
	        var field = obj.properties.createdAt;
	        expect(field.type).to.equal('string');
	        expect(field.format).to.equal('date-time');
	    });
	    it('object should have correct email field', function () {
	        var field;
	        field = obj.properties.email;
	        expect(field.type).to.equal('string');
	        expect(field.format).to.equal('email');
	    });
	    it('object should have correct uri field', function () {
	        var field;
	        field = obj.properties.avatarUrl;
	        expect(field.type).to.equal('string');
	        expect(field.format).to.equal('uri');
	    });
	    it('object should have correct null field', function () {
	        var field;
	        field = obj.properties.empty;
	        expect(field.type).to.equal('null');
	    });
	    it('object should not allow additional properties', function () {
	        expect(obj.additionalProperties).to.equal(false);
	    });
	});
	describe('Schema with array', function () {
	    describe('as root schema', function () {
	        describe('and item is simple object', function () {
	            var source = [
	                {
	                    w: 'integer',
	                    h: 'integer'
	                }
	            ];
	            var obj = TerseJsonschema.parse(source);
	            it('root object should be array', function () {
	                expect(obj.type).to.equal('array');
	            });
	            it('should have correct object in array items', function () {
	                var item;
	                item = obj.items;
	                expect(item.type).to.equal('object');
	                expect(item.properties.w.type).to.equal('integer');
	                expect(item.properties.h.type).to.equal('integer');
	            });
	        });
	    });
	    describe('as array field', function () {
	        describe('contains object', function () {
	            var source = {
	                photos: [
	                    {
	                        w: 'integer',
	                        h: 'integer'
	                    }
	                ]
	            };
	            var obj = TerseJsonschema.parse(source);
	            it('should have correct array field', function () {
	                var field;
	                field = obj.properties.photos;
	                expect(field.type).to.equal('array');
	            });
	            it('should have correct object in array items', function () {
	                var item;
	                item = obj.properties.photos.items;
	                expect(item.type).to.equal('object');
	                expect(item.properties.w.type).to.equal('integer');
	                expect(item.properties.h.type).to.equal('integer');
	            });
	        });
	        describe('contains simple types', function () {
	            var source = {
	                foos: ['string']
	            };
	            var obj = TerseJsonschema.parse(source);
	            it('should have correct array field', function () {
	                var field;
	                field = obj.properties.foos;
	                expect(field.type).to.equal('array');
	            });
	            it('should have correct object in array items', function () {
	                var item;
	                item = obj.properties.foos.items;
	                expect(item.type).to.equal('string');
	            });
	        });
	    });
	});
	describe('Schema with embedded objects', function () {
	    var source = {
	        user: {
	            username: 'string'
	        },
	        config: {
	            user: {
	                verified: 'boolean'
	            }
	        }
	    };
	    var obj = TerseJsonschema.parse(source);
	    it('should be a object', function () {
	        expect(obj.type).to.equal('object');
	        expect(obj.properties).to.be.instanceOf(Object);
	    });
	    it('object should have level-1 embedded object', function () {
	        var field, subfield;
	        field = obj.properties.user;
	        expect(field.type).to.equal('object');
	        subfield = field.properties.username;
	        expect(subfield.type).to.equal('string');
	    });
	    it('object should have level-2 embedded object', function () {
	        var field, subfield;
	        field = obj.properties.config.properties.user;
	        expect(field.type).to.equal('object');
	        subfield = field.properties.verified;
	        expect(subfield.type).to.equal('boolean');
	    });
	});
	describe('Schema with $required', function () {
	    describe('implicit required', function () {
	        var source = {
	            username: 'string',
	            age: 'integer',
	            verified: 'boolean'
	        };
	        var obj = TerseJsonschema.parse(source);
	        it('all fields should be required', function () {
	            expect(obj.required).to.have.length(3);
	            expect(obj.required).to.include('username');
	            expect(obj.required).to.include('age');
	            expect(obj.required).to.include('verified');
	        });
	    });
	    describe('and required fields explicitly', function () {
	        var source = {
	            username: 'string',
	            age: 'integer',
	            verified: 'boolean',
	            $required: 'age username'
	        };
	        var obj = TerseJsonschema.parse(source);
	        it('should only required explicit field', function () {
	            expect(obj.required).to.have.length(2);
	            expect(obj.required).to.include('age');
	            expect(obj.required).to.include('username');
	        });
	    });
	    describe('and requried nothing', function () {
	        var source = {
	            username: 'string',
	            age: 'integer',
	            verified: 'boolean',
	            $required: ''
	        };
	        var obj = TerseJsonschema.parse(source);
	        it('should requires nothing', function () {
	            expect(obj.required).to.have.length(0);
	        });
	    });
	});
	describe('Schema with $raw', function () {
	    describe('as simple field', function () {
	        var source = {
	            username: {
	                $raw: {
	                    type: 'string',
	                    minLength: 1,
	                    maxLength: 10
	                }
	            }
	        };
	        var obj = TerseJsonschema.parse(source);
	        it('should be a object', function () {
	            expect(obj.type).to.equal('object');
	            expect(obj.properties).to.be.instanceOf(Object);
	        });
	        it('should expand $raw field', function () {
	            expect(obj.properties.username).to.equal(source.username.$raw);
	        });
	    });
	});
	describe('With invalid schema', function () {
	    describe('contains $required', function () {
	        describe('does not exist', function () {
	            var source = {
	                foo: 'string',
	                $required: 'ss'
	            };
	            it('should failed with error message', function () {
	                expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, 'Required non-exist field: ss');
	            });
	        });
	        describe('with invalid format', function () {
	            var source = {
	                foo: 'string',
	                $required: ['ss']
	            };
	            it('should failed with error message', function () {
	                expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, '$required should be string');
	            });
	        });
	    });
	    describe('contains nonexist type', function () {
	        var source = {
	            foo: 'bar'
	        };
	        it('should failed with error message', function () {
	            expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, 'Type is not defined: bar');
	        });
	    });
	});
	describe('Schema with custom type', function () {
	    var source = {
	        date: 'Date'
	    };
	    var glob = {
	        Date: {
	            $raw: {
	                type: 'string',
	                pattern: '^\\d{4}-\\d{2}-\\d{2}$'
	            }
	        }
	    };
	    var obj = TerseJsonschema.parse(source, glob);
	    it('should be a object', function () {
	        expect(obj.type).to.equal('object');
	        expect(obj.properties).to.be.instanceOf(Object);
	    });
	    it('should replace the custom type', function () {
	        expect(obj.properties.date).to.equal(glob.Date.$raw);
	    });
	});
	describe('Schema with oneOf', function () {
	    var source = {
	        date: {
	            $oneOf: [
	                'integer',
	                'null'
	            ]
	        }
	    };
	    var obj = TerseJsonschema.parse(source);
	    it('should be correct', function () {
	        expect(obj.type).to.equal('object');
	        expect(obj.properties).to.be.instanceOf(Object);
	        expect(obj.properties.date.oneOf).to.be.instanceOf(Array);
	        expect(obj.properties.date.oneOf[0]).to.be.instanceOf(Object);
	    });
	});
	//# sourceMappingURL=TerseJsonschema_test.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("source-map-support");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("chai");

/***/ },
/* 3 */,
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
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("lodash");

/***/ }
/******/ ]);
//# sourceMappingURL=TerseJsonschema_test.js.map