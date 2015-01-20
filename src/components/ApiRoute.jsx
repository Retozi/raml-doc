var React = require('react');
var State = require('react-router').State;
var marked = require('marked');

// a mixin that provides convenient access to router state and raml obj state
var RamlState = {
    getActiveApiRoute() {
        var params = this.getParams();
        var urlLevels = Object.keys(params);
        urlLevels.sort();
        return "/" + urlLevels.map((l) => params[l]).join("/");
    },
    // loop recursively over the raml document and get the Raml data of
    // a given route
    getRamlData(route) {
        var res;
        function _traverse(r) {
            var fullPath = r.parentUrl + r.relativeUri;
            if (res) {
                return;
            } else if (fullPath === route) {
                res = r;
            } else if (r.resources) {
                r.resources.forEach(_traverse);
            }
        }
        this.props.raml.resources.forEach(_traverse);

        return res;
    },
};


var Code = React.createClass({

    render() {
        return (
            <pre>
                <code>
                    {this.props.children}
                </code>
            </pre>
        );
    }
});



// a panel that you can close by clicking the header
var Panel = React.createClass({
    propTypes: {
        type: React.PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger']).isRequired,
        header: React.PropTypes.string.isRequired,
        closed: React.PropTypes.bool,
        onToggle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            closed: false
        };
    },
    render() {
        return (
            <div
             className={"panel panel-" + this.props.type}
             data-clickable={!!this.props.onToggle}
             data-closed={this.props.closed}
             onClick={this.props.onToggle}>
                <div className="panel-heading">{this.props.header}</div>
                {this.props.children}
            </div>
        );
    }
});

var Schema = React.createClass({

    render() {
        if (!this.props.schemaData) {
            return null;
        }
        return (
            <div>
                <strong>Schema</strong>
                <Code>
                    {this.props.schemaData}
                </Code>
            </div>
        );
    }
});



var Example = React.createClass({

    render() {
        if (!this.props.exampleData) {
            return null;
        }
        return (
            <div>
                <strong>Example</strong>
                <Code>
                    {this.props.exampleData}
                </Code>
            </div>
        );
    }
});


var Body = React.createClass({
    render() {
        if (!this.props.bodyData) {
            return null;
        }
        var respFormats = Object.keys(this.props.bodyData);
        if (respFormats > 1) {
            console.warn("raml-doc does not support multiple response formats yet");
        }
        var body = this.props.bodyData[respFormats[0]];
        return (
            <div>
                <strong>Body</strong>
                <Example exampleData={body.example}/>
                <Schema schemaData={body.schema}/>
            </div>
        );
    }
});


var Request = React.createClass({
    render() {
        if (!this.props.requestData.body && !this.props.requestData.header) {
            return null;
        }
        return (
            <div className="list-group-item">
                <h4>Request</h4>
                <Body bodyData={this.props.requestData.body}/>
            </div>
        );
    }
});


var Response = React.createClass({
    renderDescription() {
        var desc = this.props.responseData.description;
        if (desc) {
            return <div dangerouslySetInnerHTML={{__html: marked(desc)}}/>;
        }
    },
    render() {
        console.log(this.props.responseData);
        return (
            <div className="list-group-item">
                <h4>{"Response: " + this.props.statusCode}</h4>
                {this.renderDescription()}
                <Body bodyData={this.props.body}/>
            </div>
        );
    }
});


// documents a single method (collapsible)
var UriMethod = React.createClass({
    renderDescription() {
        var desc = this.props.methodData.description;
        if (desc) {
            //not dangerous since marked sanatizes html
            return <div
                    className="panel-body"
                    dangerouslySetInnerHTML={{__html: marked(desc)}}/>;
        }
    },
    renderResponses() {
        var resp = this.props.methodData.responses;
        if (resp) {
            // responses is an object!
            return Object.keys(resp).map((statusCode) => {
                return <Response
                        responseData={resp[statusCode]}
                        statusCode={statusCode}
                        key={statusCode}/>;
            });
        }
    },
    render() {
        return (
            <Panel type="default" header={this.props.methodData.method}>
                {this.renderDescription()}
                <div className="list-group">
                    <Request requestData={this.props.methodData}/>
                    {this.renderResponses()}
                </div>
            </Panel>
        );
    }
});


// Documents all the Methods of the Uri
var UriMethods = React.createClass({
    getInitialState() {
        return {
            expandedMethod: null
        };
    },
    renderMethods() {
        return this.props.methodData.map((m) => {
            return <UriMethod
                    methodData={m}
                    open={this.state.expandedMethod === m.method}
                    key={m.method}
                    />;
        });
    },
    render() {
        // some Uris don't have methods
        if (!this.props.methodData) {
            return null;
        }
        return (
            <div>
                {this.renderMethods()}
            </div>
        );
    }
});


var ApiRoute = React.createClass({
    mixins: [ State, RamlState],
    render() {
        var apiUriData = this.getRamlData(this.getActiveApiRoute());
        return (
            <Panel type="default" header={apiUriData.parentUrl + apiUriData.relativeUri}>
                <div className="panel-body">
                    <UriMethods methodData={apiUriData.methods} key={this.getActiveApiRoute()}/>
                </div>
            </Panel>
        );
    }
});

module.exports = ApiRoute;
