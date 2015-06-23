/// <reference path="../typings/references.d.ts" />

import _ = require('lodash');

interface ObjectNode {
    [idx: string]: any;
    $raw?: JsonschemaType;
    $oneOf?: Node[];
    $allOf?: Node[];
    $anyOf?: Node[];
    $required?: string;
}


type Type = string;

export type Node = ObjectNode | ObjectNode[] | string[] | Type;

interface TypeDefs {
    [idx: string]: Node;
}

export interface JsonschemaType {
    type: string;
    description?: string;
    properties?: {[idx: string]: JsonschemaNode};
    items?: JsonschemaNode;
    additionalProperties?: boolean;
    required?: string[];
}

interface JsonschemaEnum {
    enum: string[];
}

interface AllAnyOneOfJsonschemaType {
    [idx: string]: JsonschemaType[];
}

type JsonschemaNode = JsonschemaType | AllAnyOneOfJsonschemaType | JsonschemaEnum;

function parseNode(source: Node, defs?: TypeDefs): JsonschemaNode {
    if (_.isArray(source)) {
        return parseArray(<ObjectNode[] | string[]> source, defs);
    }

    if (_.isObject(source)) {
        var objectSource = <ObjectNode> source;
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
        return parseString(<Type> source, defs);
    }

    throw new Error("Syntax error, does not support " + typeof source + " field");
}

function parseOf(type: string, source: ObjectNode, defs: TypeDefs): AllAnyOneOfJsonschemaType {
    if (!_.isArray(source['$' + type])) {
        throw new Error(type + " must be array");
    }
    var res: AllAnyOneOfJsonschemaType = {};
    res[type] = source['$' + type].map(function(e: Node) {
        return parseNode(e, defs);
    });
    return res;
}

function parseString(source:string, defs: TypeDefs): JsonschemaNode {
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
            return parseNode(defs[source]);

    }
}

function parseRequired(source: ObjectNode) {
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


function parseObject(source: ObjectNode , defs: TypeDefs): JsonschemaType {
    var obj: JsonschemaType = {
        type: 'object',
        properties: {},
        required: parseRequired(source),
        additionalProperties: false
    };

    Object.keys(source).forEach(function(k) {
        if (k !== '$required') {
            obj.properties[k] = parseNode(source[k], defs);
        }
    });

    return obj;
}

function parseArray(array: Node[] | string[], defs: TypeDefs): JsonschemaNode {
    if (array.length === 0) {
        throw new Error("array must be length > 0");
    }

    if (array.length > 1) {
        return <JsonschemaEnum> {enum: array};
    }

    return {
        type: "array",
        items: parseNode(array[0], defs)
    };
}


export function parse(source: Node, defs?: TypeDefs) {
    if (_.isArray(source) || _.isObject(source)) {
        return parseNode(source, defs);
    }
    throw new Error('source must be Array or Object');
}
