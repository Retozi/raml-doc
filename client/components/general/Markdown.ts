/// <reference path="../../../typings/references.d.ts" />


import React = require('react');
import marked = require('marked');

interface Props {
    className?: string;
    md: string;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {
            className: this.props.className,
            dangerouslySetInnerHTML: {__html: marked(this.props.md)}
        });
    }
}

export var Factory = React.createFactory(Component);
