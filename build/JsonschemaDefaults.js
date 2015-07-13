/// <reference path="../typings/references.d.ts" />
var _ = require('lodash');
function addDefaults(schema) {
    parseNode(schema);
}
exports.addDefaults = addDefaults;
function checkRef(node) {
    if (node.$ref && node.$ref[0] !== "#") {
        throw new Error("$ref " + node.$ref + ", a ref must always start with '#'");
    }
}
function checkNull(node) {
    if (node === null) {
        throw new Error("do not use null, but use a string that says 'null'");
    }
}
function parseNode(node) {
    if (node.type === 'object') {
        node.additionalProperties = false;
        if (!node.required) {
            node.required = Object.keys(node.properties);
        }
        Object.keys(node.properties).forEach(function (n) { return parseNode(node.properties[n]); });
        return;
    }
    if (_.isArray(node)) {
        node.forEach(function (n) { return parseNode(n); });
        return;
    }
    if (_.isPlainObject(node)) {
        checkRef(node);
        Object.keys(node).forEach(function (n) { return parseNode(node[n]); });
        return;
    }
    checkNull(node);
    return;
}
