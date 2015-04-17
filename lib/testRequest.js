"use strict";
/*
 * This module extends supertest with a method that automatically validates
 * The schema of a response body, if there is one.
*/
const methods = require('methods');
const BlueBirdPromise = require("bluebird");
const validateJson = require('./validateJson');
const http = require('http');
// lets extend supertest
const Test = require('supertest').Test;
const URL = require('url');

// an additional method to validate the schema. You need to specify
// the expected status first...


var assert = Test.prototype.assert;
Test.prototype.assert = function(res, fn) {
    var done = function done(err, r) {
        if (err) {
            var msg = this.request().path + ' \n' + err.message;
            if (res.body) {
                console.log(res.body);
            }
            err.message = msg;
        }
        return fn(err, r);
    }.bind(this);

    assert.call(this, res, done);
};

Test.prototype.getPath = function() {
    // since the request is absolute, we have to remove the basePath to be able to
    // look up the method
    var baseUri = this.ramlSpec.getData().baseUri;
    var basePath = URL.parse(baseUri).pathname;
    var req = this.request();
    return req.path.replace(basePath, '');
};

Test.prototype.expectBody = function(status, schemaLookup) {

    if (!status) {
        throw new Error('you must expect a status');
    }
    var path = schemaLookup || this.getPath();

    if (path[0] !== '/') {
        path = '/' + path;
    }

    var method = this.request().method;

    this.expect(function validateSchema(res) {

        // replicate the expect status code behavior of supertest
        if (res.status !== status) {
            var a = http.STATUS_CODES[status];
            var b = http.STATUS_CODES[res.status];
            throw new Error(
                'expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"'
            );
        }

        var schema = this.ramlSpec.extractResponseSchema(path, method, status);

        if (!schema) {
            throw new Error("if you expect a Body, you must define a schema");
        }
        var errs = validateJson(schema, res.body);
        if (errs.length > 0) {
            var errStrs = errs.map(function(e) {
                return e.field + ": " + e.message;
            });

            throw new Error(JSON.stringify(errStrs, null, 2));
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

        //remove trailing slash if there is one
        if (baseUrl[baseUrl.length - 1] === '/') {
            baseUrl = baseUrl.slice(0, baseUrl.length - 1);
        }

        methods.forEach(function(method) {
            obj[method] = function(url) {

                // add preceeding slash if there is none
                if (url[0] !== '/') {
                    url = '/' + url;
                }

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
