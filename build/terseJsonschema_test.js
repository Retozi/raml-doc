var TerseJsonschema = require('./TerseJsonschema');
var chai = require('chai');
var expect = chai.expect;
describe('Simple 1 level schema', function () {
    var source = {
        username: 'string',
        age: 'integer',
        verified: 'boolean',
        gender: ['F', 'M'],
        weight: 'number',
        email: 'email',
        avatarUrl: 'uri',
        createdAt: 'date-time',
        empty: 'null'
    };
    var obj = TerseJsonschema.parse(source);
    it('should be a object', function () {
        expect(obj.type).to.equal('object');
        expect(obj.properties).to.be.instanceOf(Object);
    });
    it('object should have correct string field', function () {
        expect(obj.properties.username.type).to.equal('string');
    });
    it('object should have correct integer field', function () {
        expect(obj.properties.age.type).to.equal('integer');
    });
    it('object should have correct number field', function () {
        expect(obj.properties.weight.type).to.equal('number');
    });
    it('object should have correct boolean field', function () {
        expect(obj.properties.verified.type).to.equal('boolean');
    });
    it('object should have correct enum field', function () {
        var field = obj.properties.gender;
        expect(field.enum).to.have.length(2);
        expect(field.enum).to.include('F');
        expect(field.enum).to.include('M');
    });
    it('object should have correct date field', function () {
        var field = obj.properties.createdAt;
        expect(field.type).to.equal('string');
        expect(field.format).to.equal('date-time');
    });
    it('object should have correct email field', function () {
        var field;
        field = obj.properties.email;
        expect(field.type).to.equal('string');
        expect(field.format).to.equal('email');
    });
    it('object should have correct uri field', function () {
        var field;
        field = obj.properties.avatarUrl;
        expect(field.type).to.equal('string');
        expect(field.format).to.equal('uri');
    });
    it('object should have correct null field', function () {
        var field;
        field = obj.properties.empty;
        expect(field.type).to.equal('null');
    });
    it('object should not allow additional properties', function () {
        expect(obj.additionalProperties).to.equal(false);
    });
});
describe('Schema with array', function () {
    describe('as root schema', function () {
        describe('and item is simple object', function () {
            var source = [
                {
                    w: 'integer',
                    h: 'integer'
                }
            ];
            var obj = TerseJsonschema.parse(source);
            it('root object should be array', function () {
                expect(obj.type).to.equal('array');
            });
            it('should have correct object in array items', function () {
                var item;
                item = obj.items;
                expect(item.type).to.equal('object');
                expect(item.properties.w.type).to.equal('integer');
                expect(item.properties.h.type).to.equal('integer');
            });
        });
    });
    describe('as array field', function () {
        describe('contains object', function () {
            var source = {
                photos: [
                    {
                        w: 'integer',
                        h: 'integer'
                    }
                ]
            };
            var obj = TerseJsonschema.parse(source);
            it('should have correct array field', function () {
                var field;
                field = obj.properties.photos;
                expect(field.type).to.equal('array');
            });
            it('should have correct object in array items', function () {
                var item;
                item = obj.properties.photos.items;
                expect(item.type).to.equal('object');
                expect(item.properties.w.type).to.equal('integer');
                expect(item.properties.h.type).to.equal('integer');
            });
        });
        describe('contains simple types', function () {
            var source = {
                foos: ['string']
            };
            var obj = TerseJsonschema.parse(source);
            it('should have correct array field', function () {
                var field;
                field = obj.properties.foos;
                expect(field.type).to.equal('array');
            });
            it('should have correct object in array items', function () {
                var item;
                item = obj.properties.foos.items;
                expect(item.type).to.equal('string');
            });
        });
    });
});
describe('Schema with embedded objects', function () {
    var source = {
        user: {
            username: 'string'
        },
        config: {
            user: {
                verified: 'boolean'
            }
        }
    };
    var obj = TerseJsonschema.parse(source);
    it('should be a object', function () {
        expect(obj.type).to.equal('object');
        expect(obj.properties).to.be.instanceOf(Object);
    });
    it('object should have level-1 embedded object', function () {
        var field, subfield;
        field = obj.properties.user;
        expect(field.type).to.equal('object');
        subfield = field.properties.username;
        expect(subfield.type).to.equal('string');
    });
    it('object should have level-2 embedded object', function () {
        var field, subfield;
        field = obj.properties.config.properties.user;
        expect(field.type).to.equal('object');
        subfield = field.properties.verified;
        expect(subfield.type).to.equal('boolean');
    });
});
describe('Schema with $required', function () {
    describe('implicit required', function () {
        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean'
        };
        var obj = TerseJsonschema.parse(source);
        it('all fields should be required', function () {
            expect(obj.required).to.have.length(3);
            expect(obj.required).to.include('username');
            expect(obj.required).to.include('age');
            expect(obj.required).to.include('verified');
        });
    });
    describe('and required fields explicitly', function () {
        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean',
            $required: 'age username'
        };
        var obj = TerseJsonschema.parse(source);
        it('should only required explicit field', function () {
            expect(obj.required).to.have.length(2);
            expect(obj.required).to.include('age');
            expect(obj.required).to.include('username');
        });
    });
    describe('and requried nothing', function () {
        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean',
            $required: ''
        };
        var obj = TerseJsonschema.parse(source);
        it('should requires nothing', function () {
            expect(obj.required).to.have.length(0);
        });
    });
});
describe('Schema with $raw', function () {
    describe('as simple field', function () {
        var source = {
            username: {
                $raw: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 10
                }
            }
        };
        var obj = TerseJsonschema.parse(source);
        it('should be a object', function () {
            expect(obj.type).to.equal('object');
            expect(obj.properties).to.be.instanceOf(Object);
        });
        it('should expand $raw field', function () {
            expect(obj.properties.username).to.equal(source.username.$raw);
        });
    });
});
describe('With invalid schema', function () {
    describe('contains $required', function () {
        describe('does not exist', function () {
            var source = {
                foo: 'string',
                $required: 'ss'
            };
            it('should failed with error message', function () {
                expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, 'Required non-exist field: ss');
            });
        });
        describe('with invalid format', function () {
            var source = {
                foo: 'string',
                $required: ['ss']
            };
            it('should failed with error message', function () {
                expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, '$required should be string');
            });
        });
    });
    describe('contains nonexist type', function () {
        var source = {
            foo: 'bar'
        };
        it('should failed with error message', function () {
            expect(function () { return TerseJsonschema.parse(source); }).to.throw(Error, 'Type is not defined: bar');
        });
    });
});
describe('Schema with custom type', function () {
    var source = {
        date: 'Date'
    };
    var glob = {
        Date: {
            $raw: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            }
        }
    };
    var obj = TerseJsonschema.parse(source, glob);
    it('should be a object', function () {
        expect(obj.type).to.equal('object');
        expect(obj.properties).to.be.instanceOf(Object);
    });
    it('should replace the custom type', function () {
        expect(obj.properties.date).to.equal(glob.Date.$raw);
    });
});
describe('Schema with oneOf', function () {
    var source = {
        date: {
            $oneOf: [
                'integer',
                'null'
            ]
        }
    };
    var obj = TerseJsonschema.parse(source);
    it('should be correct', function () {
        expect(obj.type).to.equal('object');
        expect(obj.properties).to.be.instanceOf(Object);
        expect(obj.properties.date.oneOf).to.be.instanceOf(Array);
        expect(obj.properties.date.oneOf[0]).to.be.instanceOf(Object);
    });
});
//# sourceMappingURL=terseJsonschema_test.js.map