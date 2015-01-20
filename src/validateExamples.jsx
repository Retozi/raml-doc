var validateJson = require('jsonschema').validate;
var csonschema = require('csonschema');
var yaml = require('js-yaml');

function processBody(body, customTypes) {
    var jsonSchema, json;
    if (!body) {
        return;
    }
    var exampleStr = body['application/json'].example;
    var schemaStr = body['application/json'].schema;
    if (exampleStr && schemaStr) {
        try {
            jsonSchema = csonschema.parse(schemaStr, customTypes);
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
        return;
    }
    var responseExamples = {};
    Object.keys(responses).forEach(function(key) {
        var bodyExample = processBody(responses[key].body, customTypes);
        if (bodyExample) {
            responseExamples[key] = bodyExample;
        }
    });
    if (Object.keys(responseExamples).length > 0) {
        return responseExamples;
    }
}

function processMethods(methods, customTypes) {
    if (!methods) {
        return;
    }
    var methodExamples = {};
    methods.forEach(function(m) {
        var bodyExample = processBody(m.body, customTypes);
        var resExamples = processResponseBodies(m.responses, customTypes);
        var method = {};
        if (bodyExample) {
            method.req = bodyExample;
        }
        if (resExamples) {
            method.res = resExamples;
        }
        if (Object.keys(method).length > 0) {
            methodExamples[m.method] = method;
        }
    });
    if (Object.keys(methodExamples).length > 0) {
        return methodExamples;
    }
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



function validateExamles(ramlObj) {
    var errors = {};
    var customTypes = yaml.safeLoad(ramlObj.schemas[0].customTypes);
    getExamples(ramlObj.resources, customTypes, errors);

    return errors;
}

module.exports = validateExamles;
