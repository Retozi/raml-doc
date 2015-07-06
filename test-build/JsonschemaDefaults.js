/// <reference path="../typings/references.d.ts" />
var _ = require('lodash');
function addDefaults(schema) {
    parseNode(schema);
}
exports.addDefaults = addDefaults;
function parseNode(node) {
    if (node.type === 'object') {
        node.additionalProperties = false;
        node.required = Object.keys(node.properties);
        Object.keys(node.properties).forEach(function (n) { return parseNode(n); });
        return;
    }
    if (_.isArray(node)) {
        parseNode(node[0]);
        return;
    }
    if (_.isObject(node)) {
        Object.keys(node).forEach(function (n) { return parseNode(n); });
        return;
    }
    return;
}
//# sourceMappingURL=JsonschemaDefaults.js.map