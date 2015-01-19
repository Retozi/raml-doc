var React = require('react');
var State = require('react-router').State;
var cx = React.addons.classSet;

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


// documents a Request
var Request = React.createClass({

    render() {
        return (
            <div className="list-group-item"/>
        );
    }
});


// documents a response
var Response = React.createClass({

    render() {
        return (
            <div className="list-group-item"/>
        );
    }
});


// documents a single method (collapsible)
var UriMethod = React.createClass({
    render() {
        return (
            <Panel type="default" header={this.props.methodData.method}>
                <div className="panel-body">
                    test
                </div>
                <div className="list-group">
                    <Request/>
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
        console.log(this.props.apiUriData.methods);
        return this.props.apiUriData.methods.map((m) => {
            return <UriMethod
                    methodData={m}
                    open={this.state.expandedMethod === m.method}
                    key={m.method}
                    />
        })
    },
    render() {
        if (!this.props.apiUriData.methods) {
            return;
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
    // if we hit a Uris with no methods, it's a "group" and we display summary
    // otherwise we display the doc of the Uris
    render() {
        var apiUriData = this.getRamlData(this.getActiveApiRoute());
        console.log(apiUriData);
        return (
            <Panel type="default" header={apiUriData.parentUrl + apiUriData.relativeUri}>
                <div className="panel-body">
                    <UriMethods apiUriData={apiUriData} key={this.getActiveApiRoute()}/>
                </div>
            </Panel>
        );
    }
});

module.exports = ApiRoute;
