
var React = require('react/addons');
var Link = require('react-router').Link;
var RouterState = require('react-router').State;

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
    'get': <Badge type="info" icon="arrow-down" key="get"/>,
    'post': <Badge type="success" icon="plus" key="post"/>,
    'put': <Badge type="warning" icon="pencil"key="put"/>,
    'patch': <Badge type="warning" icon="pencil"key="patch"/>,
    'delete': <Badge type="danger" icon="times" key="delete"/>
};

var ListItem = React.createClass({
    mixins: [RouterState],
    makeTarget() {
        var s = this.getQuery().source;
        if (s) {
            return this.props.to + '?source=' + s;
        }
        return this.props.to;
    },
    getClassName() {
        if (this.props.to === this.getPathname()) {
            return 'list-group-item active';
        }
        return 'list-group-item';
    },
    render() {
        var style = {paddingLeft: 10 + this.props.indent * 20};
        if (this.props.methods.length > 0) {
            return (
                <Link
                 className={this.getClassName()}
                 to={this.makeTarget()}
                 style={style}>
                    {this.props.caption}
                    {this.props.methods.map((m) => BADGES[m])}
                </Link>
            );
        } else {
            style.color = '#ccc';
            return (
                <div className="list-group-item" style={style}>
                    {this.props.caption}
                </div>
            );
        }
    }
});

var Home = React.createClass({

    render() {
        return (
            <ListGroup>
                <Link className="list-group-item" to="/home">Home</Link>
            </ListGroup>
        );
    }
});

function renderItem(r) {
    var methods = r.methods ? r.methods.map((m) => m.method) : [];
    return <ListItem
            caption={r.relativeUri}
            methods={methods}
            indent={r.nestingLevel}
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
        if( !this.props.raml) {
            return null;
        }
        return (
            <div className="col-md-4" style={{paddingTop: 40, paddingRight: 30}}>
                <Home/>
                {this.renderGroups()}
            </div>
        );
    }
});

module.exports = Nav;
