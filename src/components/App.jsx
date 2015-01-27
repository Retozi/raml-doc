var React = require('react');
var enrichRamlObj = require('../enrichRamlObj');
var raml = require('raml-parser');
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
            errors: null
        };
    },
    componentDidMount() {
        this.reloadRaml();
        // if the global variable is set, listen to file changes of the dev server
        // too lazy to make a dev and a prod bundle...
        if (window.DEV_SERVER_URL) {
            console.log("listening to changes in raml files");
            var socket = require('socket.io-client')(window.DEV_SERVER_URL);
            socket.on("raml", this.reloadRaml);
        }
    },
    // if the app receives a link, we parse it, else we directly set the state from the
    // external prop. (not perfectly idiomatic, but practical here)
    reloadRaml() {
        var source = this.props.options.ramlPath || this.getQuery().source;
        if (source) {
            raml.loadFile(source).done((data) => {
                enrichRamlObj(data);
                this.setState({raml: data});
            }, function(err) {
                this.setState({validationErrors: [err]});
            });
        }
        if (this.props.ramlData) {
            this.setState({raml: this.props.ramlData});
        }
    },
    render() {
        if (!this.state.raml) {
            return <div className="container"/>;
        }
        return (
            <div className="container">
                <div className="row">
                    <Nav raml={this.state.raml}/>
                    <div className="col-md-8">
                        <div className="page-header">
                            <h1>
                                {this.state.raml.title}
                                <small> version {this.state.raml.version}</small>
                            </h1>
                        </div>
                        <Errors errors={this.state.validationErrors}/>
                        <RouteHandler raml={this.state.raml}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = App;
