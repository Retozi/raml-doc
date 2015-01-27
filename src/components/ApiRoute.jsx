require('highlight.js/styles/default.css');
var React = require('react');
var marked = require('marked');
var State = require('react-router').State;
var Navigation = require('react-router').Navigation;
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


var DescHeader = React.createClass({

    render() {
        return (
            <dt style={{fontWeight: 'normal', fontStyle: 'italic'}}>
                {this.props.children}
            </dt>
        );
    }
});


// a mixin that provides convenient access to router state and raml obj state
var RamlState = {
    // this assembles a route with the source query param, but not with
    // method params
    getActiveApiRoute() {
        var url = this.getPathname();
        var querySource = this.getQuery().source;
        if (querySource) {
            url = url + '?source=' + querySource;
        }
        return url;
    },
    getExpandedMethod() {
        return this.getQuery().method || null;
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
    renderHeaderItems() {
        var res = [];
        Object.keys(this.props.headers).forEach((h, i) => {
            var v = this.props.headers[h];
            res.push(
                <DescHeader key={"h-" + i}>
                    {v.displayName || h}
                </DescHeader>
            );
            res.push(<HeaderAttributeDescription {...v} key={"desc-" + i}/>);
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
                    {this.renderHeaderItems()}
                </div>
            </section>
        );
    }
});


var Request = React.createClass({
    render() {
        if (!this.props.body && !this.props.headers) {
            return null;
        }
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


var ParamEnum = React.createClass({

    render() {
        return (
            <p>
                <em>Choices: </em>
                {
                    this.props.enum.map((e) => <code style={{marginRight: 3}}>{e}</code>)
                }
            </p>
        );
    }
});


var QueryParamDescription = React.createClass({
    render() {
        var p = this.props;
        return <dd style={{paddingBottom: 10}}>
            {p.type && <code>{p.type}</code>}
            {p.required && " (required)"}
            {p.description && <p dangerouslySetInnerHTML={{__html: marked(p.description)}}/>}
            {p.default && <p className="text-info default">{"Default: " + p.default}</p>}
            {p.example && <p className="text-muted">{"Example: " + p.example}</p>}
            {p.enum && <ParamEnum enum={p.enum}/>}
        </dd>;
    }
});


var QueryParams = React.createClass({
    renderParams() {
        var res = [];
        Object.keys(this.props.queryParams).forEach((p, i) => {
            var v = this.props.queryParams[p];
            res.push(
                <dt key={"h-" + i}>
                    {v.displayName || p}
                </dt>
            );
            res.push(<QueryParamDescription {...v} key={"desc-" + i}/>);
        });
        return res;
    },
    render() {
        if (!this.props.queryParams) {
            return null;
        }
        return (
            <div className="list-group-item">
                <h3>Query Parameters</h3>
                <div className="dl-horizontal">
                    {this.renderParams()}
                </div>
            </div>
        );
    }
});


var BUTTON_CONTEXTS = {
    get: 'primary',
    post: 'success',
    put: 'warning',
    'delete': 'danger',
    patch: 'warning'
};

var METHOD_CONTEXTS = {
    get: 'info',
    post: 'success',
    put: 'warning',
    'delete': 'danger',
    patch: 'warning'
};

// documents a single method (collapsible)
var UriMethod = React.createClass({
    renderHeader() {
        var d = this.props.methodData;
        return [
            <div
             className={`btn btn-${BUTTON_CONTEXTS[d.method]} btn-xs`}
             style={{textTransform: "uppercase"}}
             key="button">
                {d.method}
            </div>,

            d.securedBy ? <i className="fa fa-lock" key="lock" style={{marginLeft: 5}}/> : null,

            <code key="code" style={{marginLeft: 5}}>{this.props.url}</code>,

            <span key="name" style={{float: 'right'}}>
                {d.displayName}
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
                    <QueryParams queryParams={this.props.methodData.queryParameters}/>
                    <Request {...this.props.methodData} key="req"/>
                    <Responses responses={this.props.methodData.responses}/>
                </div>
            </Panel>
        );
    }
});


// Documents all the Methods of the Uri
var UriMethods = React.createClass({
    mixins: [Navigation, State, RamlState],
    toggle(method) {
        var route = this.getActiveApiRoute();
        if (method !== this.getExpandedMethod()) {
            var key = (route.indexOf("?") > -1) ? '&method=' : '?method=';
            this.transitionTo(route + key + method);
        } else {
            this.transitionTo(route);
        }
    },
    renderMethods() {
        return this.props.methodData.map((m) => {
            return <UriMethod
                    methodData={m}
                    url={this.props.url}
                    open={this.getExpandedMethod() === m.method}
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
        var apiUriData = this.getRamlData(this.getPathname());
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
                     key={this.getPath()}/>
                </div>
            </Panel>
        );
    }
});

module.exports = ApiRoute;
