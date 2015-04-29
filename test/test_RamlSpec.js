"use strict";

var ramlSpec = require('../lib/ramlSpec');

var should = require('should');

var FILE = './fixture/api.raml';

describe('RamlSpec', function() {
    var s;
    it('should fetch async', function() {
        return ramlSpec.loadAsync(FILE)
            .then(function(data) {
                s = data;
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

    it('extract null when no schema', function() {
        var schema = s.extractResponseSchema('test2', 'get', 403);
        should(null).equal(schema);
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

    it('works without global types', function() {
        ramlSpec.loadAsync('./fixture/no-global-types.raml')
            .then(function(obj) {
                var schema = obj.extractPayloadSchema('test', 'post');
                schema.should.be.instanceOf(Object);
            });
    });

});
