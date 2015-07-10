require('source-map-support').install();
import RamlSpec = require('./RamlSpec');
import chai = require('chai');

var expect = chai.expect;

var FILE = './fixture/api.raml';

describe('RamlSpec', function(): void {
    var s: RamlSpec.RamlSpec;
    it('should fetch async', function(done: Function): void {
        RamlSpec.loadAsync(FILE)
            .then(function(data: RamlSpec.RamlSpec): void {
                s = data;
                expect(data.getData().version).to.equal('1');
                done();
            }).done();
    });

    it('returns data', function(): void {
        expect(s.getData().version).to.equal('1');
    });

    it('returns routes', function(): void {
        expect(s.getSchemaData().routes.length).to.equal(3);
    });

    it('should get Methods', function(): void {
        expect(s.getMethods('test2/{id}').length).to.equal(1);
        expect(s.getMethods('/test2/{id}').length).to.equal(1);
        expect(s.getMethods('/bla}').length).to.equal(0);
    });

    it('should get method', function(): void {
        expect(s.getMethod('test2/{id}', 'post')).to.include.keys('displayName');
        expect(s.getMethod('test2/{id}', 'get')).to.be.not.ok;
    });

    it('should extract Payload Json body', function(): void {
        var pay = s.extractPayloadJsonBody('test1', 'put');
        expect(pay.example).to.be.a('string');
        expect(pay.schema).to.be.a('string');
        expect(pay.parsedExample.result).to.be.a('object');
        expect(pay.parsedSchema.result).to.be.a('object');
    });

    it('should extract missing Payload Json body gracefully', function(): void {
        var empty = RamlSpec.emptyJsonBody();
        expect(s.extractPayloadJsonBody('test1', 'post')).to.eql(empty);
        expect(s.extractPayloadJsonBody('test2', 'post')).to.eql(empty);
    });

    it('should extract Response Json body', function(): void {
        var pay = s.extractResponseJsonBody('test1', 'put', '200');
        expect(pay.example).to.be.a('string');
        expect(pay.schema).to.be.a('string');
        expect(pay.parsedExample.result).to.be.a('object');
        expect(pay.parsedSchema.result).to.be.a('object');
    });

    it('should extract missing Response Json body gracefully', function(): void {
        var empty = RamlSpec.emptyJsonBody();
        expect(s.extractResponseJsonBody('test1', 'post', '200')).to.eql(empty);
        expect(s.extractResponseJsonBody('test2', 'post', '200')).to.eql(empty);
    });

    it('works without global types', function(done: Function): void {
        RamlSpec.loadAsync('./fixture/no-global-types.raml')
            .then(function(obj: RamlSpec.RamlSpec): void {
                var m = obj.getMethod('test', 'post');
                expect(m).be.instanceOf(Object);
                done();
            });
    });

});


describe('ParseErrors', function(): void {
    it('should parse a json error', function(): void {
        var errors = new RamlSpec.ParseErrors();
        var body = RamlSpec.emptyJsonBody();
        body.parsedExample = new RamlSpec.ParsedExample('{"hello": "world}');
        errors.registerErrors('url', 'method', 'status', body);
        expect(errors.errors[0].message).to.equal("json parsing error: Unexpected end of input");

    });

    it('should parse invalid yaml schema error', function(): void {
        var errors = new RamlSpec.ParseErrors();
        var body = RamlSpec.emptyJsonBody();
        body.parsedExample = new RamlSpec.ParsedSchema(
            "key: 'string"
        );
        errors.registerErrors('url', 'method', 'status', body);
        expect(errors.errors[0].message).to.contain("yaml parsing error:");

    });

    it('should parse a validation error', function(): void {
        var errors = new RamlSpec.ParseErrors();
        var body = RamlSpec.emptyJsonBody();
        body.parsedSchema = new RamlSpec.ParsedSchema(`
            type: object
            properties:
                key:
                    type: 'number'
        `);
        body.parsedExample = new RamlSpec.ParsedExample('{"key": "test"}');
        errors.registerErrors('url', 'method', 'status', body);
        expect(errors.errors[0].message).to.equal("data.key: is the wrong type");

    });
});


describe('Validator', function(): void {
    it('should validate a schema', function(done: Function): void {
        RamlSpec.loadAsync(FILE)
            .then(function(data: RamlSpec.RamlSpec): void {
                var validator = new RamlSpec.Validator(data);
                var errors = validator.validate();
                expect(errors.length).to.equal(0);
                done();
            }).done();
    });
});
