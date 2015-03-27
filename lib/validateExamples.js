"use strict";

var validateJson = require('jsonschema').validate;


function validate(schema, example) {
    var err = validateJson(example, schema, {throwError: false}).errors;
    if (err) {
        return err;
    }
    return [];
}

function makeError(url, method, status, message) {
    return {
        url: url,
        method: method,
        status: status || null,
        message: message
    };
}

function* validatePayload(url, method, ramlObj) {
    var schema;
    var example;
    try {
        schema = ramlObj.extractPayloadSchema(url, method);
    } catch (err) {
        yield makeError(url, method, null, err.toString());
    }
    try {
        example = ramlObj.extractPayloadExample(url, method);
    } catch (err) {
        yield makeError(url, method, null, "JSON parse: " + err.message);
    }
    if (schema && example) {
        for (var e of validate(schema, example)) {
            yield makeError(url, method, null, e.stack);
        }
    }
}


function* validateResponse(url, method, status, ramlObj) {
    var schema;
    var example;
    try {
        schema = ramlObj.extractResponseSchema(url, method, status);
    } catch (err) {
        yield makeError(url, method, status, err.toString());
    }
    try {
        example = ramlObj.extractResponseExample(url, method, status);
    } catch (err) {
        yield makeError(url, method, status, "JSON parse: " + err.message);
    }
    if (schema && example) {
        for (var e of validate(schema, example)) {
            yield makeError(url, method, null, e.stack);
        }
    }
}

function* methods(r) {
    if (!r.methods) {
        return;
    }
    for (var m of Object.keys(r.methods)) {
        yield m;
    }
}

function* responses(r, method) {
    if (!r.methods || !r.methods[method].responses) {
        return;
    }

    for (var resp of Object.keys(r.methods[method].responses)) {
        yield resp;
    }
}

function* validateRoutes(ramlObj) {
    var routes = ramlObj.getRoutes();
    for (var r of routes) {
        for (var method of methods(r)) {
            for (var err1 of validatePayload(r.url, method, ramlObj)) {
                yield err1;
            }

            for (var resp of responses(r, method)) {
                for (var err2 of validateResponse(r.url, method, resp, ramlObj)) {
                    yield err2;
                }
            }
        }
    }
}

function validateExamles(ramlObj) {
    var res = [];
    for (var err of validateRoutes(ramlObj)) {
        res.push(err);
    }
    if (res.length > 0) {
        return res;
    }
    return null;
}

module.exports = validateExamles;
