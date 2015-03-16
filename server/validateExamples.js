var validateJson = require('jsonschema').validate;
var terseJsonschema = require('terse-jsonschema');
var yaml = require('js-yaml');
var enrichRamlObj = require('../src/enrichRamlObj');

// return undefined if obj does not have valid key,value pairs
function onlyContent(obj) {
    if (!obj) {
        return null;
    }
    // remove empty keys
    Object.keys(obj).forEach(function(k) {
        if (!obj[k]) {
            delete obj[k];
        }
    });

    if (Object.keys(obj).length > 0) {
        return obj;
    }
}

function processBody(body, customTypes) {
    var jsonSchema, json;
    if (!body) {
        return null;
    }
    var exampleStr = body['application/json'].example;
    var schemaStr = body['application/json'].schema;
    if (exampleStr && schemaStr) {
        try {
            jsonSchema = terseJsonschema.parse(yaml.safeLoad(schemaStr), customTypes);
            json = JSON.parse(exampleStr);
        } catch(err) {
            return [err];
        }
        var errors = validateJson(json, jsonSchema, {throwError: false}).errors;
        if (errors.length > 0) {
            return errors;
        }
    }
}


function processResponseBodies(responses, customTypes) {
    if (!responses) {
        return null;
    }
    var responseExamples = {};
    Object.keys(responses).forEach(function(key) {
        var bodyExample = processBody(responses[key].body, customTypes);
        responseExamples[key] = onlyContent(bodyExample);
    });
    return onlyContent(responseExamples);
}

function processMethods(methods, customTypes) {
    if (!methods) {
        return null;
    }
    var methodExamples = {};
    methods.forEach(function(m) {
        var method = {
            req: processBody(m.body, customTypes),
            res: processResponseBodies(m.responses, customTypes)

        };
        methodExamples[m.method] = onlyContent(method);
    });
    return onlyContent(methodExamples);
}


function getExamples(resources, customTypes, obj) {
    resources.forEach(function(r) {
        var methods = processMethods(r.methods, customTypes);
        if (methods) {
            obj[r.absUrl] = methods;
        }
        if (r.resources) {
            getExamples(r.resources, customTypes, obj);
        }
    });
}

function _flatten(obj, idArray, res) {
    if (obj instanceof Array) {
        res.push({id: idArray, errors: obj});
    } else {
        Object.keys(obj).forEach(function(k) {
            _flatten(obj[k], idArray.concat([k]), res);
        });
    }
}

function flattenErrors(errorsObj) {
    var res = [];
    _flatten(errorsObj, [], res);
    return res;
}

function extractCustomTypes(schemas) {
    var types = {};
    schemas.forEach(function(s) {
        Object.keys(s).forEach(function(t) {
            types[t] = yaml.safeLoad(s[t]);
        });
    });
    return types;
}

function validateExamles(ramlObj) {
    ramlObj = enrichRamlObj(ramlObj);
    var errors = {};
    var customTypes = extractCustomTypes(ramlObj.schemas);
    getExamples(ramlObj.resources, customTypes, errors);

    if (Object.keys(errors).length > 0) {
        return flattenErrors(errors);
    }
    return null;
}

module.exports = validateExamles;
