require('highlight.js/styles/default.css');
var React = require('react');

var hljs = require('highlight.js/lib/highlight');
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/coffeescript'));

var State = require('react-router').State;
var marked = require('marked');
var Panel = require('./Panel');

// render a markdown description
function renderDescription(desc) {
    if (desc) {
        return <div dangerouslySetInnerHTML={{__html: marked(desc)}}
                style={{paddingBottom: 40, paddingTop: 20}}/>;
    }
}

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
    componentDidMount() {
        this.highlightCode();
    },
    componentDidUpdate() {
        this.highlightCode();
    },
    highlightCode() {
        var domNode = this.getDOMNode();
        var nodes = domNode.querySelectorAll('pre code');
        if (nodes.length > 0) {
            for (var i = 0; i < nodes.length; i=i+1) {
                hljs.highlightBlock(nodes[i]);
          }
        }
    },
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


var Schema = React.createClass({

    render() {
        if (!this.props.schemaData) {
            return null;
        }
        return (
            <div>
                <em>Body schema</em>
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
                <em>Body example</em>
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
    render() {
        return (
            <div className="list-group-item">
                <h4>{"Response: " + this.props.statusCode}</h4>
                {renderDescription(this.props.responseData.description)}
                <Body bodyData={this.props.responseData.body}/>
            </div>
        );
    }
});

var BUTTON_CONTEXTS = {
    get: 'primary',
    post: 'success',
    put: 'warning',
    'delete': 'danger'
};

var METHOD_CONTEXTS = {
    get: 'info',
    post: 'success',
    put: 'warning',
    'delete': 'danger'
};

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
    renderHeader() {
        var met = this.props.methodData.method;
        return [
            <div
             className={`btn btn-${BUTTON_CONTEXTS[met]} btn-xs`}
             style={{textTransform: "uppercase"}}>
                {met}
            </div>,
            <code>{this.props.url}</code>,
            <span style={{float: 'right'}}>{this.props.methodData.displayName}</span>
        ];
    },
    render() {
        return (
            <Panel
             open={this.props.open}
             onToggle={this.props.toggle}
             type={METHOD_CONTEXTS[this.props.methodData.method]}
             header={this.renderHeader()}>
                {this.renderDescription(this.props.methodData.description)}
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
    toggle(method) {
        var newState = null;
        if (method !== this.state.expandedMethod) {
            newState = method;
        }
        this.setState({expandedMethod: newState});
    },
    renderMethods() {
        return this.props.methodData.map((m) => {
            return <UriMethod
                    methodData={m}
                    url={this.props.url}
                    open={this.state.expandedMethod === m.method}
                    toggle={() => this.toggle(m.method)}
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
            <Panel type="default" header={<h4>{apiUriData.absUrl}</h4>}>
                <div className="panel-body">
                    {renderDescription(apiUriData.description)}
                    <UriMethods
                     methodData={apiUriData.methods}
                     url={apiUriData.absUrl}
                     key={this.getActiveApiRoute()}/>
                </div>
            </Panel>
        );
    }
});

module.exports = ApiRoute;
