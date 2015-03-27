"use strict";

var validateExamples = require('../server/validateExamples');
var ramlSpec = require('../server/ramlSpec');
var should = require('should');


var FILE = './fixture/api.raml';
var INVALID_PAY = './fixture/unparseable-payload.raml';
var INVALID_JSON = './fixture/unparseable-response.raml';
var MISMATCH = './fixture/example-not-matching-schema.raml';

describe('validate examples', function() {
    it('valid does not produce errors', function() {
        var s = ramlSpec.loadSync(FILE);
        var errs = validateExamples(s);
        errs.length.should.equal(0);
    });

    it('invalid payload description produces errors', function() {
        var s = ramlSpec.loadSync(INVALID_PAY);
        var errs = validateExamples(s);
        errs.length.should.equal(2);
    });

    it('invalid response description produces errors', function() {
        var s = ramlSpec.loadSync(INVALID_JSON);
        var errs = validateExamples(s);
        errs.length.should.equal(2);
    });

    it('schema does not match example', function() {
        var s = ramlSpec.loadSync(MISMATCH);
        var errs = validateExamples(s);
        errs.length.should.equal(1);
    });
});
