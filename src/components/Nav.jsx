
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


var ListItem = React.createClass({
    getDefaultProps() {
        return {
            heading: false
        };
    },
    render() {
        var cls = cx({"list-group-item": true, "heading": this.props.heading});
        return (
            <Link className={cls} to={this.props.to} style={{paddingLeft: this.props.indent * 20}}>
                {this.props.caption}
            </Link>
        );
    }
});

var Home = React.createClass({

    render() {
        return (
            <ListGroup>
                <ListItem caption="Home" heading={true} to="/"/>
            </ListGroup>
        );
    }
});

function renderItem(r) {
    var indent = r.absUrl.split('/').length - 1;
    return <ListItem
            caption={r.displayName || r.relativeUri}
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
            <div className="col-md-3">
                <Home/>
                {this.renderGroups()}
            </div>
        );
    }
});

module.exports = Nav;
