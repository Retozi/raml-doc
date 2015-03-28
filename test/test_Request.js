"use strict";
var testRequest = require('../lib/testRequest');
var ramlSpec = require('../lib/ramlSpec');
var should = require('should');

describe('testRequest', function() {
    it('github meta validates', function(done) {
        var SPEC = ramlSpec.loadSync('./fixture/github.raml');
        var request = testRequest(SPEC)('https://api.github.com');
        return request.get('/meta')
            .expectBody(200)
            .end(done);
    });

    it('github meta validates with trailing slash root', function() {
        var SPEC = ramlSpec.loadSync('./fixture/github.raml');
        var request = testRequest(SPEC)('https://api.github.com/');
        return request.get('/meta')
            .expectBody(200)
            .promise();
    });

    it('wrong github fails', function() {
        var SPEC = ramlSpec.loadSync('./fixture/invalid-github.raml');
        var request = testRequest(SPEC)('https://api.github.com');
        return request.get('/meta')
            .expectBody(200)
            .then(function() {
                should.fail("promise should not resolve");
            })['catch'](function() {
                return;
            });
    });

});
