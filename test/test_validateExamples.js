"use strict";

var validateExamples = require('../lib/validateExamples');
var ramlSpec = require('../lib/ramlSpec');
var should = require('should');


var FILE = './fixture/api.raml';
var INVALID_PAY = './fixture/unparseable-payload.raml';
var INVALID_JSON = './fixture/unparseable-response.raml';
var MISMATCH = './fixture/example-not-matching-schema.raml';
var GITHUB = './fixture/github.raml';

describe('validate examples', function() {
    it('valid does not produce errors', function() {
        ramlSpec.loadAsync(FILE)
            .then(function(s) {
                var errs = validateExamples(s);
                should(null).equal(errs);
            });

    });

    it('invalid payload description produces errors', function() {
        ramlSpec.loadAsync(INVALID_PAY)
            .then(function(s) {
                var errs = validateExamples(s);
                errs.length.should.equal(2);
            });
    });

    it('invalid response description produces errors', function() {
        ramlSpec.loadAsync(INVALID_JSON)
            .then(function(s) {
                var errs = validateExamples(s);
                errs.length.should.equal(2);
            });
    });

    it('schema does not match example', function() {
        ramlSpec.loadAsync(MISMATCH)
            .then(function(s) {
                var errs = validateExamples(s);
                errs.length.should.equal(1);
                errs[0].message.should.equal("data.id: is the wrong type");
            });
    });

    it('github schema is ok', function() {
        ramlSpec.loadAsync(GITHUB)
            .then(function(s) {
                var errs = validateExamples(s);
                should(null).equal(errs);
            });
    });
});
