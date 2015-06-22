
import watch = require("node-watch");
import path = require("path");
import fs = require('fs');
import express = require('express');
import RamlSpec = require('../lib/RamlSpec');
import cheerio = require('cheerio');

function template() {
    return cheerio.load(fs.readFileSync(path.join(__dirname, 'index.html'), "utf8"));
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
    $('body').append(
        '<script src="https://rawgit.com/Retozi/raml-doc/master/build/raml-doc.js"></script>'
    );
    return $.html();
}

function expressServer(port) {
    var app = express();

    app.use(express['static'](path.join(__dirname, '../build')));

    app.get('/', function(req, res) {
        res.send(devHtml(port));
    });

    return app.listen(port);
}

function sendRamlToSocket(socket, bundle) {
    return function(ramlSpecObj) {
        var errors = validateExamples(ramlSpecObj);
        var data = ramlSpecObj.getData();
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
        var errors = [{url: "YAML Parse Error", message: JSON.stringify(err)}];
        socket.emit("raml", {raml: null, validationErrors: errors});
    };
}

function sendDataToSocket(options) {
    return function(socket) {
        RamlSpec.loadAsync(options.source)
            .then(sendRamlToSocket(socket, options.bundle))
            .fail(sendParseErrorToSocket(socket))
            .done();
    };
}

interface Options {
    source: string;
    bundle: string;
}

export class Server {
    options: Options;
    constructor(options) {
        this.options = options;
    }
    
    listen(port: number) {
        var server = expressServer(port);
        var io = require('socket.io').listen(server);

        // send data the first time
        io.on('connection', this.sendDataToSocket());

        // send data whenever files change
        watch(path.dirname(this.options.source), (filename: string) => {
            var ext = path.extname(filename);
            if (ext !== '.html' && ext !== '.js') {
                this.sendDataToSocket(this.options)(io);
            }
        });
    }

    sendDataToSocket() {
        return (socket) => {
            RamlSpec.loadAsync(this.options.source)
                .then(sendRamlToSocket(socket, this.options.bundle))
                .fail(sendParseErrorToSocket(socket))
                .done();
        };
    }
}

