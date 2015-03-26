"use strict";

const raml = require('raml-parser');
const CSON = require('cson');
const terseJsonschema = require('terse-jsonschema');

function parseSync(file) {
    var res;
    // async load of the RAML spec. THis does not block!
    raml.loadFile(file)
        .then(function(data) {
            res = data;
        }).done();


    //ugly block here with deasync. We need to block until the RAML is loaded,
    //otherwise we cannot proceed
    (function() {
        while (!res) {
            require('deasync').sleep(100);
        }
    })();
    return res;
}


// extract the global types from the schema. This is needed for correct validation
function parseGlobalTypes(ramlObj) {
    var types = {};
    ramlObj.schemas.forEach(function(s) {
        Object.keys(s).forEach(function(t) {
            types[t] = CSON.parse(s[t]);
        });
    });
    return types;
}

//convert array into object for easier access
function parseMethods(methods) {
    var res = {};
    methods.forEach(function(m) {
        res[m.method] = m;
    });
    return res;
}


//parse a flat array of all urls from the raml spec
function parseRoutes(ramlObj) {
    var s = [];

    function walk(subObj, parentUrl) {
        if (!subObj.resources) {
            return;
        }
        subObj.resources.forEach(function(r) {
            r.parentUrl = parentUrl || '';
            r.absUrl = r.parentUrl + r.relativeUri;
            if (r.methods) {
                s.push({url: r.absUrl, methods: parseMethods(r.methods)});
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


function parseSchemaStr(schemaStr, globalTypes) {
    var schema = CSON.parse(schemaStr);
    return terseJsonschema.parse(schema, globalTypes);
}


function ramlSpec(data) {
    var _routes = parseRoutes(data);
    var _globalTypes = parseGlobalTypes(data);

    function extractResponseJsonDef(path, method, status) {
        method = method.toLowerCase();
        var methods = getMethods(path, _routes);
        // along the way, you could always run into undefined...
        return methods
            && methods[method]
            && methods[method].responses
            && methods[method].responses[status]
            && methods[method].responses[status].body
            && methods[method].responses[status].body["application/json"];
    }

    function extractPayloadJsonDef(path, method) {
        var methods = getMethods(path, _routes);
        return methods
            && methods[method]
            && methods[method].body
            && methods[method].body["application/json"];
    }

    function parseIfSchemaStr(schemaStr) {
        if (schemaStr) {
            return parseSchemaStr(schemaStr, _globalTypes);
        }
        return null;
    }

    function parseIfExampleStr(exampleStr) {
        if (exampleStr) {
            return JSON.parse(exampleStr);
        }
    }
    return {
        getData: function() {
            return data;
        },
        getRoutes: function() {
            return _routes;
        },
        extractResponseSchema: function(path, method, status) {
            var schemaStr = extractResponseJsonDef(path, method, status).schema;
            return parseIfSchemaStr(schemaStr);
        },
        extractResponseExample: function(path, method, status) {
            var schemaStr = extractResponseJsonDef(path, method, status).example;
            return parseIfExampleStr(schemaStr);
        },
        extractPayloadSchema: function(path, method) {
            var schemaStr = extractPayloadJsonDef(path, method).schema;
            return parseIfSchemaStr(schemaStr);

        },
        extractPayloadExample: function(path, method) {
            var exampleStr = extractPayloadJsonDef(path, method).example;
            return parseIfExampleStr(exampleStr);
        }
    };
}


module.exports = {
    loadSync: function(path) {
        return ramlSpec(parseSync(path));
    },
    loadAsync: function(path) {
        return raml.loadFile(path)
            .then(function(data) {
                return ramlSpec(data);
            });
    }
};
