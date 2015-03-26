"use strict";

var ramlSpec = require('../server/ramlSpec');
require('should');

var FILE = './fixture/api.raml';

describe('RamlSpec', function() {
    var s = ramlSpec.loadSync(FILE);

    it('should fetch async', function() {
        return ramlSpec.loadAsync(FILE)
            .then(function(data) {
                data.getData().version.should.equal('1');
            });
    });

    it('return data', function() {
        s.getData().version.should.equal('1');
    });

    it('extract response schema', function() {
        var schema = s.extractResponseSchema('auth-token', 'get', 403);
        schema.type.should.equal('object');
    });

    it('extract payload schema', function() {
        var schema = s.extractPayloadSchema('test1', 'put');
        schema.type.should.equal('object');
    });

    it('extract response example', function() {
        var example = s.extractResponseExample('auth-token', 'get', 403);
        example.reason.should.be.instanceOf(Object);
    });

    it('extract payload example', function() {
        var example = s.extractPayloadExample('test1', 'put');
        example.vignetteNrs.should.be.instanceOf(Array);
    });
});
