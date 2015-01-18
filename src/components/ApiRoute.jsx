var React = require('react');
var State = require('react-router').State;

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

// the documentation of a specific Uri
var UriContent = React.createClass({

    render() {
        return (
            <div />
        );
    }
});

// an overview over the children Uris
var UriSummary = React.createClass({

    render() {
        return (
            <div />
        );
    }
});


var ApiRoute = React.createClass({
    mixins: [ State, RamlState],
    // if we hit a Uris with no methods, it's a "group" and we display summary
    // otherwise we display the doc of the Uris
    render() {
        var data = this.getRamlData(this.getActiveApiRoute());
        if (!data.methods) {
            return <UriSummary data={data}/>;
        } else {
            return <UriContent data={data}/>;
        }
    }
});

module.exports = ApiRoute;
