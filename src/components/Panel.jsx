var React = require('react');

// a panel that you can close by clicking the header
var Panel = React.createClass({
    propTypes: {
        type: React.PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger']).isRequired,
        header: React.PropTypes.node.isRequired,
        open: React.PropTypes.bool,
        onToggle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            open: true
        };
    },
    render() {
        return (
            <div
             className={"panel panel-" + this.props.type}
             data-clickable={!!this.props.onToggle}
             data-closed={this.props.closed}>
                <div
                 className="panel-heading"
                 onClick={this.props.onToggle}
                 style={{cursor: "pointer"}}>
                    {this.props.header}
                 </div>
                {(this.props.open) ? this.props.children : null}
            </div>
        );
    }
});

module.exports = Panel;
