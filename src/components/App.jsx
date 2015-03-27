"use strict";
var React = require('react');
var enrichRamlObj = require('../enrichRamlObj');
//var raml = require('raml-parser');
var Nav = require('./Nav');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var RouterState = Router.State;
var Errors = require('./Errors');

var App = React.createClass({
    mixins: [RouterState],
    getInitialState() {
        return {
            raml: null,
            validationErrors: null
        };
    },
    setRamlState(rml, validationErrors) {
        this.setState({
            raml: enrichRamlObj(rml) || null,
            validationErrors: validationErrors || null
        });
    },
    loadFromSource() {
        var source = this.props.source || this.getQuery().source;
        if (source) {
            /*
            DOES NOT WORK BECAUSE raml-parser FUCKUP... let's wait for newer versions
            (only with hot reload...??)

            raml.loadFile(source).then((parsedRaml) => {
                this.setRamlState(parsedRaml, null);
            }).fail(function(err) {
                // convert the error into the same format as a schema validation error
                var errors = [{id: "YAML Parse Error", errors: [err]}];
                this.setRamlState(null, errors);
            }).done();
            */
        } else if (this.props.raml) {
            this.setRamlState(this.props.raml, null);
        }
    },
    componentDidMount() {
        this.loadFromSource();
        // if the we get a socket option, listen to file changes of the dev server
        // too lazy to make a dev and a prod bundle...
        if (this.props.socket) {
            console.log("listening to changes in raml files");
            var socket = require('socket.io-client')(this.props.socket);
            socket.on("raml", (d) => this.setRamlState(d.raml, d.validationErrors));
        }
    },
    renderPageHeader() {
        if (this.state.raml) {
            return <div className="page-header">
                <h1>
                    {this.state.raml.title}
                    <small> version {this.state.raml.version}</small>
                </h1>
            </div>;
        }
        return null;
    },
    render() {
        if (!this.state.raml && !this.state.validationErrors) {
            return <div className="container"/>;
        }
        return (
            <div className="container">
                <div className="row">
                    <Nav raml={this.state.raml}/>
                    <div className="col-md-8">
                        {this.renderPageHeader()}
                        <Errors errors={this.state.validationErrors}/>
                        <RouteHandler raml={this.state.raml}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = App;
