/// <reference path="../typings/references.d.ts" />
var _ = require('lodash');
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
<<<<<<< HEAD:build/TerseJsonschema.js
//# sourceMappingURL=TerseJsonschema.js.map
=======
>>>>>>> new_client:build/TerseJsonschema.js
