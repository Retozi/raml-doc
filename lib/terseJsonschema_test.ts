/*eslint-env node, mocha */
/*eslint max-nested-callbacks: 0 */
/*eslint no-unused-expressions: 0 */

var csonschema = require('..');
var should = require('should');


describe('Simple 1 level schema', function() {

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

    var obj = csonschema.parse(source);

    it('should be a object', function() {
        obj.type.should.equal('object');
        obj.properties.should.be.instanceOf(Object);
    });

    it('object should have correct string field', function() {
        obj.properties.username.type.should.equal('string');
    });

    it('object should have correct integer field', function() {
        obj.properties.age.type.should.equal('integer');
    });
    it('object should have correct number field', function() {
        obj.properties.weight.type.should.equal('number');
    });
    it('object should have correct boolean field', function() {
        obj.properties.verified.type.should.equal('boolean');
    });
    it('object should have correct enum field', function() {
        var field = obj.properties.gender;
        field.enum.should.have.length(2);
        field.enum.should.include('F');
        field.enum.should.include('M');
    });
    it('object should have correct date field', function() {
        var field = obj.properties.createdAt;
        field.type.should.equal('string');
        field.format.should.equal('date-time');
    });
    it('object should have correct email field', function() {
        var field;
        field = obj.properties.email;
        field.type.should.equal('string');
        field.format.should.equal('email');
    });
    it('object should have correct uri field', function() {
        var field;
        field = obj.properties.avatarUrl;
        field.type.should.equal('string');
        field.format.should.equal('uri');
    });
    it('object should have correct null field', function() {
        var field;
        field = obj.properties.empty;
        field.type.should.equal('null');
    });
    it('object should not allow additional properties', function() {
        obj.additionalProperties.should.be.False;
    });
});


describe('Schema with array', function() {
    describe('as root schema', function() {
        describe('and item is simple object', function() {

            var source = [
                {
                    w: 'integer',
                    h: 'integer'
                }
            ];

            var obj = csonschema.parse(source);


            it('root object should be array', function() {
                obj.type.should.equal('array');
            });

            it('should have correct object in array items', function() {
                var item;
                item = obj.items;
                item.type.should.equal('object');
                item.properties.w.type.should.equal('integer');
                item.properties.h.type.should.equal('integer');
            });
        });
    });

    describe('as array field', function() {
        describe('contains object', function() {

            var source = {
                photos: [
                    {
                        w: 'integer',
                        h: 'integer'
                    }
                ]
            };

            var obj = csonschema.parse(source);


            it('should have correct array field', function() {
                var field;
                field = obj.properties.photos;
                field.type.should.equal('array');
            });

            it('should have correct object in array items', function() {
                var item;
                item = obj.properties.photos.items;
                item.type.should.equal('object');
                item.properties.w.type.should.equal('integer');
                item.properties.h.type.should.equal('integer');
            });
        });


        describe('contains simple types', function() {

            var source = {
                foos: ['string']
            };

            var obj = csonschema.parse(source);


            it('should have correct array field', function() {
                var field;
                field = obj.properties.foos;
                field.type.should.equal('array');
            });

            it('should have correct object in array items', function() {
                var item;
                item = obj.properties.foos.items;
                item.type.should.equal('string');
            });
        });
    });
});


describe('Schema with embedded objects', function() {
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

    var obj = csonschema.parse(source);

    it('should be a object', function() {
        obj.type.should.equal('object');
        obj.properties.should.be.instanceOf(Object);
    });

    it('object should have level-1 embedded object', function() {
        var field, subfield;
        field = obj.properties.user;
        field.type.should.equal('object');
        subfield = field.properties.username;
        subfield.type.should.equal('string');
    });

    it('object should have level-2 embedded object', function() {
        var field, subfield;
        field = obj.properties.config.properties.user;
        field.type.should.equal('object');
        subfield = field.properties.verified;
        subfield.type.should.equal('boolean');
    });
});


describe('Schema with $required', function() {

    describe('implicit required', function() {
        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean'
        };

        var obj = csonschema.parse(source);


        it('all fields should be required', function() {
            obj.required.should.have.length(3);
            obj.required.should.include('username');
            obj.required.should.include('age');
            obj.required.should.include('verified');
        });
    });


    describe('and required fields explicitly', function() {
        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean',
            $required: 'age username'
        };

        var obj = csonschema.parse(source);


        it('should only required explicit field', function() {
            obj.required.should.have.length(2);
            obj.required.should.include('age');
            obj.required.should.include('username');
        });
    });

    describe('and requried nothing', function() {

        var source = {
            username: 'string',
            age: 'integer',
            verified: 'boolean',
            $required: ''
        };


        var obj = csonschema.parse(source);

        it('should requires nothing', function() {
            obj.required.should.have.length(0);
        });
    });
});


describe('Schema with $raw', function() {
    describe('as simple field', function() {
        var source = {
            username: {
                $raw: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 10
                }
            }
        };
        var obj = csonschema.parse(source);
        it('should be a object', function() {
            obj.type.should.equal('object');
            obj.properties.should.be.instanceOf(Object);
        });
        it('should expand $raw field', function() {
            obj.properties.username.should.equal(source.username.$raw);
        });
    });
});

describe('With invalid schema', function() {
    describe('contains $required', function() {
        describe('does not exist', function() {
            var source = {
                foo: 'string',
                $required: 'ss'
            };
            it('should failed with error message', function() {
                try {
                    csonschema.parse(source);
                    should.fail('no error thrown');
                } catch (err) {
                    err.message.should.equal('Required non-exist field: ss');
                }
            });
        });
        describe('with invalid format', function() {
            var source = {
                foo: 'string',
                $required: ['ss']
            };
            it('should failed with error message', function() {
                try {
                    csonschema.parse(source);
                    should.fail('no error thrown');
                } catch(err) {
                    err.message.should.equal('$required should be string');
                }
            });
        });
    });
    describe('contains nonexist type', function() {

        var source = {
            foo: 'bar'
        };

        it('should failed with error message', function() {
            try {
                csonschema.parse(source);
                should.fail('no error thrown');
            } catch (err) {
                err.message.should.equal('Type is not defined: bar');
            }
        });
    });
});


describe('Schema with custom type', function() {
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

    var obj = csonschema.parse(source, glob);

    it('should be a object', function() {
        obj.type.should.equal('object');
        obj.properties.should.be.instanceOf(Object);
    });
    it('should replace the custom type', function() {
        obj.properties.date.should.equal(glob.Date.$raw);
    });
});


describe('Schema with oneOf', function() {
    var source = {
        date: {
            $oneOf: [
                'integer',
                'null'
            ]
        }
    };


    var obj = csonschema.parse(source);

    it('should be correct', function() {
        obj.type.should.equal('object');
        obj.properties.should.be.instanceOf(Object);
        obj.properties.date.oneOf.should.be.instanceOf(Array);
        obj.properties.date.oneOf[0].should.be.instanceOf(Object);
    });

});