var watch = require("node-watch");
var path = require("path");
var fs = require('fs');
var express = require('express');
var RamlSpec = require('./RamlSpec');
var cheerio = require('cheerio');
var socket = require('socket.io');
function template() {
    return cheerio.load(fs.readFileSync(path.join(__dirname, 'base.html'), "utf8"));
}
function devHtml(port) {
    var $ = template();
    $('body').prepend('<script type="application/json" id="dev-server"/>');
    $('#dev-server').text(JSON.stringify({ 'socket': 'http://localhost:' + port }));
    $('body').append('<script src="/raml-doc.js"></script>');
    return $.html();
}
function bundleHtml(ramlObj) {
    var $ = template();
    $('body').prepend('<script type="application/json" id="raml-doc"/>');
    $('#raml-doc').text(JSON.stringify({ raml: ramlObj }));
    $('body').append('<script src="https://rawgit.com/Retozi/raml-doc/master/build/raml-doc.js"></script>');
    return $.html();
}
var ExpressServer = (function () {
    function ExpressServer(port) {
        var server = express();
        server.use(express.static(path.join(__dirname)));
        server.get('/', function (req, res) {
            res.send(devHtml(port));
        });
        this.server = server.listen(port);
    }
    return ExpressServer;
})();
var Server = (function () {
    function Server(options) {
        this.options = options;
    }
    Server.prototype.listen = function (port) {
        var _this = this;
        this.port = port;
        this.server = new ExpressServer(this.port);
        this.io = socket.listen(this.server.server);
        // send data the first time
        this.io.on('connection', function () { return _this.sendDataToSocket(); });
        // send data whenever files change
        watch(path.dirname(this.options.source), function (filename) {
            var ext = path.extname(filename);
            if (ext !== '.html' && ext !== '.js') {
                _this.sendDataToSocket();
            }
        });
    };
    Server.prototype.writeBundle = function (data) {
        if (this.options.bundle) {
            fs.writeFile(this.options.bundle, bundleHtml(data), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    };
    Server.prototype.sendDataToSocket = function () {
        var _this = this;
        RamlSpec.loadAsync(this.options.source)
            .then(function (spec) {
            var data = spec.getData();
            var errors = new RamlSpec.Validator(spec).validate();
            _this.io.emit("raml", { raml: data, validationErrors: errors });
            _this.writeBundle(data);
        })
            .fail(function (e) {
            var errors = [{ url: "YAML Parse Error", message: JSON.stringify(e) }];
            _this.io.emit("raml", { raml: null, validationErrors: errors });
        })
            .done();
    };
    return Server;
})();
exports.Server = Server;
//# sourceMappingURL=Server.js.map