"use strict";

var validator = require('is-my-json-valid');

module.exports = function validate(schema, example) {
    var v = validator(schema);
    v(example);
    return v.errors || [];
};
