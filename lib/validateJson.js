"use strict";

var validator = require('is-my-json-valid');

module.exports = function validate(schema, example) {
    var v = validator(schema, {greedy: true});
    v(example);

    return v.errors || [];
};
