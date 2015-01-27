"use strict";
var watch = require("node-watch");
var path = require("path");
var express = require('express');


var ramlReloadServer = express().listen(8081);
var io = require('socket.io').listen(ramlReloadServer);

// wath for any changes and render raml
watch('./assets', function() {
    //var ext = path.extname(filename);
    //if (ext === '.raml') {
    //    console.log("file changes");
    io.emit("raml");
    //}
});
