var React = require('react');
var marked = require('marked');

var Description = React.createClass({
    render() {
        if (this.props.md) {
            return (
                <div
                 className={this.props.className}
                 dangerouslySetInnerHTML={{__html: marked(this.props.md)}}
                 style={this.props.style}/>
            );
        }
        return null;
    }
});

module.exports = Description;
