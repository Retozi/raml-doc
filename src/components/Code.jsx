var React = require('react');

var hljs = require('highlight.js/lib/highlight');
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/coffeescript'));

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


module.exports = Code;
