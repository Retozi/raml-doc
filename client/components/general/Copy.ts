/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import Markdown = require('./Markdown');

interface Props {
    md: string;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return Markdown.Factory({
            className: 'rd-copy',
            md: this.props.md
        });
    }
}

export var Factory = React.createFactory(Component);