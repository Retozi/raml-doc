
var React = require('react/addons');
var Link = require('react-router').Link;

var cx = React.addons.classSet;

var ListGroup = React.createClass({
    render() {
        return (
            <div className="list-group">
                {this.props.children}
            </div>
        );
    }
});


var Badge = React.createClass({

    render() {
        return (
            <span
             className={`badge alert-${this.props.type}`}
             style={{padding: '3px 4px', margin: 4, fontSize: 10}}>
                <i className={`fa fa-${this.props.icon}`}/>
            </span>
        );
    }
});


var BADGES = {
    'get': <Badge type="info" icon="arrow-down"/>,
    'post': <Badge type="success" icon="plus"/>,
    'put': <Badge type="warning" icon="pencil"/>,
    'delete': <Badge type="danger" icon="times"/>
};

var ListItem = React.createClass({
    render() {
        var cls = cx({"list-group-item": true});
        return (
            <Link
             className={cls}
             to={this.props.to}
             style={{paddingLeft: this.props.indent * 20}}>
                {this.props.caption}
                {this.props.methods.map((m) => BADGES[m])}
            </Link>
        );
    }
});

var Home = React.createClass({

    render() {
        return (
            <ListGroup>
                <Link className="list-group-item" to="/">Home</Link>
            </ListGroup>
        );
    }
});

function renderItem(r) {
    var indent = r.absUrl.split('/').length - 1;
    var methods = r.methods ? r.methods.map((m) => m.method) : [];
    return <ListItem
            caption={r.displayName || r.relativeUri}
            methods={methods}
            indent={indent}
            to={r.absUrl}
            key={r.absUrl}/>;
}

// traverse each group recursively to render a flat list of sub-uris
function renderGroup(r) {
    var items = [renderItem(r)];

    function traverse(resource) {
        if (!resource.resources) {
            return;
        }
        resource.resources.forEach((r) => {
            items.push(renderItem(r));
            traverse(r);
        });
    }

    traverse(r);
    return <ListGroup key={r.relativeUri}>{items}</ListGroup>;

}

var Nav = React.createClass({
    // render the first level of the uri into seperate groups
    renderGroups() {
        if (this.props.raml) {
            return this.props.raml.resources.map(renderGroup);
        }
    },
    render() {
        return (
            <div className="col-md-4">
                <Home/>
                {this.renderGroups()}
            </div>
        );
    }
});

module.exports = Nav;
