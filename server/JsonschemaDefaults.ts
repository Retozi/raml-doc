/// <reference path="../typings/references.d.ts" />
import _ = require('lodash');

export function addDefaults(schema: Object): void {
    parseNode(schema);
}

function parseNode(node: any): any {
    if (_.isObject(node) && !node.type && !node.$ref) {
        throw Error("jsonschema object must either have a type or a ref");
    }
    if (node.type === 'object') {
        node.additionalProperties = false;
        if (!node.required) {
            node.required = Object.keys(node.properties);
        }
        Object.keys(node.properties).forEach((n: string) => parseNode(node.properties[n]));
        return;
    }

    if (_.isArray(node)) {
        parseNode(node[0]);
        return;
    }

    if (_.isObject(node)) {
        Object.keys(node).forEach((n: string) => parseNode(node[n]));
        return;
    }
    return;
}
