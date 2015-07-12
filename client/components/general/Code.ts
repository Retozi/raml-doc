/// <reference path="../../../typings/references.d.ts" />
require('./CodeStyles.styl');
import React = require('react');
import hljs = require('highlight.js');

interface Props {
    children?: React.ReactNode;
    language: string;
}

export class Component extends React.Component<Props, void> {
    highlightCode() {
        var domNode = React.findDOMNode(this);
        var nodes = domNode.querySelectorAll('pre code');

        if (nodes.length > 0) {
            for (var i = 0; i < nodes.length; i=i+1) {
                hljs.highlightBlock(nodes[i]);
            }
        }

    }

    componentDidMount() {
        this.highlightCode();
    }

    componentDidUpdate() {
        this.highlightCode();
    }

    render(): React.ReactNode {
        return React.createElement('pre', {className: `hljs ${this.props.language}`},
            React.createElement('code', {className: 'rd-code'},
                this.props.children
            )
        );
    }
}

export var Factory = React.createFactory(Component);
