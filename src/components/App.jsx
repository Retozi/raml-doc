var React = require('react');
var enrichRamlObj = require('../enrichRamlObj');
var raml = require('raml-parser');
var Nav = require('./Nav');
var RouteHandler = require('react-router').RouteHandler;

var App = React.createClass({
    getInitialState() {
        return {
            raml: null
        };
    },
    componentDidMount() {
        raml.loadFile(this.props.ramlPath).done((data) => {
            enrichRamlObj(data);
            this.setState({raml: data});
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
                        <RouteHandler raml={this.state.raml}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = App;
