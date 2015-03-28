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
        var s = ramlSpec.loadSync(FILE);
        var errs = validateExamples(s);
        should(null).equal(errs);

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
        errs[0].message.should.equal("data.id: is the wrong type");
    });

    it('github schema is ok', function() {
        var s = ramlSpec.loadSync(GITHUB);
        var errs = validateExamples(s);
        should(null).equal(errs);
    });
});
