/// <reference path="../typings/references.d.ts" />

import _ = require('lodash');


function parseField(source: any, defs: Object) {
    if (_.isArray(source)) {
        return parseArray(source, defs);
    }

    if (_.isObject(source)) {
        if (source.$raw) {
            return source.$raw;
        }

        if (source.$oneOf) {
            return parseOf('oneOf', source, defs);
        }

        if (source.$allOf) {
            return parseOf('allOf', source, defs);
        }
        if (source.$anyOf) {
            return parseOf('anyOf', source, defs);
        }

        return parseObject(source, defs);
    }

    if (_.isString(source)) {
        return parseString(source, defs);
    }

    throw new Error("Syntax error, does not support " + typeof source + " field");
}

function parseOf(type: string, source: Object, defs) {
    if (!_.isArray(source['$' + type])) {
        throw new Error(type + " must be array");
    }
    var res = {};
    res[type] = source['$' + type].map(function(e) {
        return parseField(e, defs);
    });
    return res;
}

function parseString(source:string, defs: Object) {
    switch (source) {
        case "string":
        case "integer":
        case "number":
        case "boolean":
        case "null":
            return {type: source};

        case "date-time":
        case "email":
        case "uri":
            return {type: 'string', format: source};

        default:
            if (!defs || !defs[source]) {
                throw new Error("Type is not defined: " + source);
            }
            return parseField(defs[source]);

    }
}

function parseRequired(source) {
    var sourceItems = Object.keys(source).filter(function(f) {
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

    required.forEach(function(r) {
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

    Object.keys(source).forEach(function(k) {
        if (k !== '$required') {
            obj.properties[k] = parseField(source[k], defs);
        }
    });

    return obj;
}

function parseArray(array: Array<any>, defs: Object): Object {
    if (array.length === 0) {
        throw new Error("array must be length > 0");
    }

    if (array.length > 1) {
        return {enum: array};
    }

    return {
        type: "array",
        items: parseField(array[0], defs)
    };
}


export function parse(source: Object | Object[], defs?: Object) {
    if (_.isArray(source) || _.isObject(source)) {
        return parseField(source, defs);
    }
    throw new Error('source must be Array or Object');
}
