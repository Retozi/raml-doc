"use strict";

const raml = require('raml-parser');
const CSON = require('cson-parser');
const terseJsonschema = require('terse-jsonschema');


// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj) {
    var types = {};
    if (!ramlObj.schemas) {
        return null;
    }
    ramlObj.schemas.forEach(function(s) {
        Object.keys(s).forEach(function(t) {
            types[t] = CSON.parse(s[t]);
        });
    });
    return types;
}


function parseSchemaStr(schemaStr, globalTypes) {
    var schema = CSON.parse(schemaStr);
    return terseJsonschema.parse(schema, globalTypes);
}

function parseDefs(data, globalTypes) {
    data = data.body && data.body['application/json'];
    if (!data) {
        return noJsonDef();
    }
    return {
        schema: data.schema && parseSchemaStr(data.schema, globalTypes),
        example: data.example && JSON.parse(data.example)
    };
}

function extractDataFromMethod(method, globalTypes) {
    var data = {
        payload: parseDefs(method)
    };
    if (method.responses) {
        Object.keys(method.responses).forEach(function(status) {
            data[status] = parseDefs(method.responses[status], globalTypes);
        });
    }
    return data;
}

//convert array into object for easier access
function parseMethods(methods, globalTypes) {
    var res = {};
    methods.forEach(function(m) {
        res[m.method] = extractDataFromMethod(m, globalTypes);
    });
    return res;
}


//parse a flat array of all urls from the raml spec
function parseRoutes(ramlObj, globalTypes) {
    var s = [];

    function walk(subObj, parentUrl) {
        if (!subObj.resources) {
            return;
        }
        subObj.resources.forEach(function(r) {
            r.parentUrl = parentUrl || '';
            r.absUrl = r.parentUrl + r.relativeUri;
            if (r.methods) {
                s.push({
                    url: r.absUrl,
                    methods: parseMethods(r.methods, globalTypes)
                });
            }
            walk(r, r.absUrl);
        });
    }
    walk(ramlObj);
    return s;
}

function getMethods(path, ramlObj) {
    if (path[0] !== '/') {
        path = "/" + path;
    }
    var pathRegex = "^" + path.replace('/', '\/') + "$";
    pathRegex = pathRegex.replace(/\{[\w]+\}/, "[^\/]+");

    pathRegex = new RegExp(pathRegex);


    var route;
    ramlObj.forEach(function(r) {
        if (pathRegex.test(r.url)) {
            route = r;
        }
    });

    if (route) {
        return route.methods;
    }
}


function noJsonDef() {
    return {
        schema: null,
        example: null
    };
}

function ramlSpec(data) {
    var _globalTypes = parseGlobalTypes(data);
    var _routes = parseRoutes(data, _globalTypes);

    function extractResponseJsonDef(path, method, status) {
        method = method.toLowerCase();
        var methods = getMethods(path, _routes);
        if (!methods || !methods[method] || !methods[method][status]) {
            return noJsonDef();
        }
        // along the way, you could always run into undefined...
        return methods[method][status];
    }

    function extractPayloadJsonDef(path, method) {
        var methods = getMethods(path, _routes);
        if (!methods || !methods[method] || !methods[method].payload) {
            return noJsonDef();
        }
        return methods[method].payload;
    }

    return {
        getData: function() {
            return data;
        },
        getRoutes: function() {
            return _routes;
        },
        extractResponseSchema: function(path, method, status) {
            return extractResponseJsonDef(path, method, status).schema;
        },
        extractResponseExample: function(path, method, status) {
            return extractResponseJsonDef(path, method, status).example;
        },
        extractPayloadSchema: function(path, method) {
            return extractPayloadJsonDef(path, method).schema;
        },
        extractPayloadExample: function(path, method) {
            return extractPayloadJsonDef(path, method).example;
        }
    };
}


module.exports = {
    loadAsync: function(path) {
        return raml.loadFile(path)
            .then(function(data) {
                return ramlSpec(data);
            });
    }
};
