
import watch = require("node-watch");
import path = require("path");
import fs = require('fs');
import express = require('express');
import RamlSpec = require('./RamlSpec');
import cheerio = require('cheerio');
import socket = require('socket.io');
import http = require('http');

function template(): CheerioStatic {
    return cheerio.load(fs.readFileSync(path.join(__dirname, 'base.html'), "utf8"));
}

function devHtml(port: number): string {
    var $ = template();
    $('body').prepend('<script type="application/json" id="dev-server"/>');
    $('#dev-server').text(JSON.stringify({'socket': 'http://localhost:' + port}));
    $('body').append('<script src="/raml-doc.js"></script>');
    return $.html();
}

function bundleHtml(ramlObj: RamlSpec.Raml): string {
    var $ = template();
    $('body').prepend('<script type="application/json" id="raml-doc"/>');
    $('#raml-doc').text(JSON.stringify({raml: ramlObj}));
    $('body').append(
        '<script src="https://rawgit.com/Retozi/raml-doc/master/build/raml-doc.js"></script>'
    );
    return $.html();
}


class ExpressServer {
    server: http.Server;

    constructor(port: number) {
        var server = express();

        server.use(express.static(path.join(__dirname)));
        server.get('/', function(req: any, res: any): void {
            res.send(devHtml(port));
        });

        this.server = server.listen(port);
    }
}

interface Options {
    source: string;
    bundle?: string;
}

export class Server {
    private options: Options;
    server: ExpressServer;
    io: SocketIO.Server;
    port: number;

    constructor(options: Options) {
        this.options = options;
    }

    listen(port: number): void {
        this.port = port;
        this.server = new ExpressServer(this.port);
        this.io = socket.listen(this.server.server);
        // send data the first time
        this.io.on('connection', () => this.sendDataToSocket());

        // send data whenever files change
        watch(path.dirname(this.options.source), (filename: string) => {
            var ext = path.extname(filename);
            if (ext !== '.html' && ext !== '.js') {
                this.sendDataToSocket();
            }
        });
    }

    private writeBundle(data: RamlSpec.Raml): void {
        if (this.options.bundle) {
            fs.writeFile(this.options.bundle, bundleHtml(data), function(err: Error): void {
                if (err) {
                    console.error(err);
                }
            });
        }
    }

    private sendDataToSocket(): void {
        RamlSpec.loadAsync(this.options.source)
            .then((spec: RamlSpec.RamlSpec) => {
                var data = spec.getData();
                var errors = new RamlSpec.Validator(spec).validate();
                this.io.emit("raml", {raml: data, validationErrors: errors});
                this.writeBundle(data);
            })
            .fail((e: Error) => {
                var errors = [{url: "YAML Parse Error", message: JSON.stringify(e)}];
                this.io.emit("raml", {raml: null, validationErrors: errors});
            })
            .done();
    }
}

