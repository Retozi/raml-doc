/// <reference path="../typings/references.d.ts" />
import _ = require('lodash');

export function addDefaults(schema: Object): void {
    parseNode(schema);
}

function checkRef(node: any) {
    if (node.$ref && node.$ref[0] !== "#") {
        throw new Error(`$ref ${node.$ref}, a ref must always start with '#'`);
    }
}

function checkNull(node: any) {
    if (node === null) {
        throw new Error("do not use null, but use a string that says 'null'");
    }
}

function parseNode(node: any): any {

    if (node.type === 'object') {
        node.additionalProperties = false;
        if (!node.required) {
            node.required = Object.keys(node.properties);
        }
        Object.keys(node.properties).forEach((n: string) => parseNode(node.properties[n]));
        return;
    }

    if (_.isArray(node)) {
        (<Array<any>> node).forEach((n: any) => parseNode(n));

        return;
    }

    if (_.isPlainObject(node)) {
        checkRef(node);
        Object.keys(node).forEach((n: string) => parseNode(node[n]));
        return;
    }

    checkNull(node)

    return;
}
