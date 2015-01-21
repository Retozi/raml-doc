var React = require('react');
var enrichRamlObj = require('../enrichRamlObj');
var raml = require('raml-parser');
var Nav = require('./Nav');
var RouteHandler = require('react-router').RouteHandler;
var socket = require('socket.io-client')('http://localhost:8081');
var validateExamples = require('../validateExamples');
var Errors = require('./Errors');


var App = React.createClass({
    getInitialState() {
        return {
            raml: null,
            errors: null
        };
    },
    componentDidMount() {
        this.reloadRaml();
        socket.on("raml", this.reloadRaml);
    },
    reloadRaml() {
        raml.loadFile(this.props.ramlPath).done((data) => {
            enrichRamlObj(data);
            this.setState({raml: data, validationErrors: validateExamples(data)});
        }, function(err) {
            console.log(err);
        });
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
