"use strict";
/*
 * This module extends supertest with a method that automatically validates
 * The schema of a response body, if there is one.
*/
const methods = require('methods');
const BlueBirdPromise = require("bluebird");
const http = require('http');
// lets extend supertest
const Test = require('supertest').Test;
const URL = require('url');

// an additional method to validate the schema. You need to specify
// the expected status first...
Test.prototype.expectBody = function(status, schemaLookup) {

    if (!status) {
        throw new Error('you must expect a status');
    }

    // since the request is absolute, we have to remove the basePath to be able to
    // look up the method
    var baseUri = this.ramlSpec.getData().baseUri;
    var basePath = URL.parse(baseUri).pathname;
    var req = this.request();
    var path = schemaLookup || req.path.replace(basePath, '');

    if (path[0] !== '/') {
        path = '/' + path;
    }

    var method = req.method;

    this.expect(function validateSchema(res) {

        // replicate the expect status code behavior of supertest
        if (res.status !== status) {
            var a = http.STATUS_CODES[status];
            var b = http.STATUS_CODES[res.status];
            throw new Error(
                'expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"'
            );
        }

        //extract response schema
        var errors = this.ramlSpec.validateSchema({
                path: path,
                method: method,
                status: status
            },
            res.body)
        ;
        // lets throw an informative error here
        if (errors.length > 0) {
            throw new Error("Schema Validation Error: \n\n" + JSON.stringify(errors, null, 2));
        }
    }.bind(this));

    return this;
};

//generate a promise that gets the response
Test.prototype.promise = function() {
    var deferred = BlueBirdPromise.defer();
    this.end(deferred.callback);
    return deferred.promise;
};

//direct then for convenience
Test.prototype.then = function(cb) {
    return this.promise().then(cb);
};

/* enter ramlSpec obj that implements extractResponseSchema to build the
   request generator that takes the base url
*/
module.exports = function(ramlSpec) {
    return function(baseUrl) {
        var obj = {};

        methods.forEach(function(method) {
            obj[method] = function(url) {
                var test = new Test(baseUrl, method, url);
                // inject the ramlSpec object to each instance
                test.ramlSpec = ramlSpec;
                return test;
            };
        });

          // Support previous use of del
        obj.del = obj['delete'];

        return obj;
    };
};
