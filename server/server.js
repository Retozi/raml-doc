"use strict";
var watch = require("node-watch");
var path = require("path");
var fs = require('fs');
var express = require('express');
var raml = require('raml-parser');
var cheerio = require('cheerio');
var validateExamples = require('./validateExamples');

function template() {
    return cheerio.load(fs.readFileSync(__dirname + '/index.html', "utf8"));
}

function devHtml(port) {
    var $ = template();
    $('body').prepend('<script type="application/json" id="dev-server"/>');
    $('#dev-server').text(JSON.stringify({'socket': 'http://localhost:' + port}));
    $('body').append('<script src="/raml-doc.js"></script>');
    return $.html();
}

function bundleHtml(ramlObj) {
    var $ = template();
    $('body').prepend('<script type="application/json" id="raml-doc"/>');
    $('#raml-doc').text(JSON.stringify({raml: ramlObj}));
    $('body').append('<script src="https://rawgit.com/Retozi/raml-doc/master/build/raml-doc.js"></script>');
    return $.html();
}

function expressServer(port) {
    var app = express();

    app.use(express.static(__dirname + '/../build'));

    app.get('/', function(req, res) {
        res.send(devHtml(port));
    });

    return app.listen(port);
}

function sendRamlToSocket(socket, bundle) {
    return function(data) {
        var errors = validateExamples(data);
        socket.emit("raml", {raml: data, validationErrors: errors});

        if (bundle) {
            fs.writeFile(bundle, bundleHtml(data), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    };
}

function sendParseErrorToSocket(socket) {
    return function(err) {
        // convert the error into the same format as a schema validation error
        var errors = [{id: "YAML Parse Error", errors: [err]}];
        socket.emit("raml", {raml: null, validationErrors: errors});
    };
}

function sendDataToSocket(options) {
    return function(socket){
        raml.loadFile(options.source)
            .then(sendRamlToSocket(socket, options.bundle))
            .fail(sendParseErrorToSocket(socket))
            .done();
    };
}

module.exports = function(options) {

    var e = {};

    e.listen = function(port) {
        var server = expressServer(port);
        var io = require('socket.io').listen(server);

        // send data the first time
        io.on('connection', sendDataToSocket(options));

        // send data whenever files change
        watch(path.dirname(options.source), function(filename) {
            var ext = path.extname(filename);
            if (ext !== '.html' && ext !== '.js') {
                sendDataToSocket(options)(io);
            }
        });

    };
    return e;

};
