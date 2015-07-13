/// <reference path="../typings/references.d.ts" />

import React = require('react');
import App = require('./components/App');

function parseProps(): App.Props {

    var devServerOptions = document.getElementById("dev-server");
    if (devServerOptions) {
        return JSON.parse(devServerOptions.innerText || devServerOptions.textContent);
    }

    var otherOptions = document.getElementById("raml-doc");
    if (otherOptions) {
        return JSON.parse(otherOptions.innerText || otherOptions.textContent);
    }

}


React.render(
    React.createElement(App.Component, parseProps()),
    document.getElementById('app-container')
);
