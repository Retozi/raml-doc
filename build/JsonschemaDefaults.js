/// <reference path="../typings/references.d.ts" />
var _ = require('lodash');
function addDefaults(schema) {
    parseNode(schema);
}
exports.addDefaults = addDefaults;
function parseNode(node) {
    if (_.isPlainObject(node) && Object.keys(node).indexOf("type") === -1 && !node.$ref) {
        throw Error("jsonschema object must either have a type or a ref\n " + JSON.stringify(node, null, 4));
    }
    if (node.type === 'object') {
        node.additionalProperties = false;
        if (!node.required) {
            node.required = Object.keys(node.properties);
        }
        Object.keys(node.properties).forEach(function (n) { return parseNode(node.properties[n]); });
        return;
    }
    if (_.isArray(node)) {
        parseNode(node[0]);
        return;
    }
    if (_.isPlainObject(node)) {
        Object.keys(node).forEach(function (n) { return parseNode(node[n]); });
        return;
    }
    return;
}
