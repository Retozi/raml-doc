require('highlight.js/styles/default.css');
var React = require('react');

var State = require('react-router').State;
var Panel = require('./Panel');
var Description = require('./Description');
var Code = require('./Code');


var SubSection = React.createClass({

    render() {
        return (
            <section style={{paddingLeft: 20}}>
                {this.props.children}
            </section>
        );
    }
});


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
            if (res) {
                return;
            } else if (r.absUrl === route) {
                res = r;
            } else if (r.resources) {
                r.resources.forEach(_traverse);
            }
        }
        this.props.raml.resources.forEach(_traverse);

        return res;
    },
};



var Schema = React.createClass({

    render() {
        if (!this.props.schemaData) {
            return null;
        }
        return (
            <div>
                <em>Schema</em>
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
                <em>Example</em>
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
                <h4>Body</h4>
                <Example exampleData={body.example}/>
                <Schema schemaData={body.schema}/>
            </div>
        );
    }
});


var HeaderAttributeDescription = React.createClass({
    render() {
        var p = this.props;
        return <dd>
            {p.type && <code>{p.type}</code>}
            {p.required && " (required)"}
            {p.description && <p>{p.description}</p>}
            {p.example && <p className="text-muted">{"Example: " + p.example}</p>}
        </dd>;
    }
});

var Headers = React.createClass({
    renderHeaderItem() {
        var res = [];
        Object.keys(this.props.headers).forEach((h) => {
            var v = this.props.headers[h];
            res.push(<dt style={{fontWeight: 'normal', fontStyle: 'italic'}}>{v.displayName || h}</dt>);
            res.push(<HeaderAttributeDescription {...v}/>);
        });
        return res;
    },
    render() {
        if (!this.props.headers) {
            return null;
        }
        return (
            <section>
                <h4>Headers</h4>
                <div className="dl-horizontal">
                    {this.renderHeaderItem()}
                </div>
            </section>
        );
    }
});


var Request = React.createClass({
    render() {
        if (!this.props.body && !this.props.header) {
            return null;
        }
        console.log(this.props.headers);
        return (
            <div className="list-group-item">
                <h3>Request</h3>
                <SubSection>
                    <Headers headers={this.props.headers}/>
                    <Body bodyData={this.props.body}/>
                </SubSection>
            </div>
        );
    }
});


var Response = React.createClass({
    render() {
        var desc = this.props.description;
        return (
            <div>
                    <span>
                        <code style={{fontSize: 18, marginRight: 5}}>
                            {this.props.statusCode}
                        </code>
                        <span>{desc}</span>
                    </span>
                <SubSection>
                    <Body bodyData={this.props.body}/>
                </SubSection>
            </div>
        );
    }
});


var Responses = React.createClass({
    renderResponses() {
        var resp = this.props.responses;
        if (resp) {
            // responses is an object!
            return Object.keys(resp).map((statusCode) => {
                return <Response
                        {...resp[statusCode]}
                        statusCode={statusCode}
                        key={statusCode}/>;
            });
        }
    },
    render() {
        return (
            <div className="list-group-item">
                <h3>Responses</h3>
                {this.renderResponses()}
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
    renderHeader() {
        var met = this.props.methodData.method;
        return [
            <div
             className={`btn btn-${BUTTON_CONTEXTS[met]} btn-xs`}
             style={{textTransform: "uppercase"}}
             key="button">
                {met}
            </div>,
            <code key="code" style={{marginLeft: 5}}>{this.props.url}</code>,
            <span key="name" style={{float: 'right'}}>
                {this.props.methodData.displayName}
            </span>
        ];
    },
    render() {
        return (
            <Panel
             open={this.props.open}
             onToggle={this.props.toggle}
             type={METHOD_CONTEXTS[this.props.methodData.method]}
             header={this.renderHeader()}>
                <Description
                 className="panel-body"
                 md={this.props.methodData.description}
                 key="desc"/>
                <div className="list-group" key="list-group">
                    <Request {...this.props.methodData} key="req"/>
                    <Responses responses={this.props.methodData.responses}/>
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
        if (!apiUriData) {
            return null;
        }
        return (
            <Panel type="default" header={<h4>{apiUriData.displayName || apiUriData.absUrl}</h4>}>
                <div className="panel-body">
                    <Description md={apiUriData.description}/>
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
