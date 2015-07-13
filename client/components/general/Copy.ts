/// <reference path="../../../typings/references.d.ts" />
require('./CopyStyles.styl');
import React = require('react');
import Markdown = require('./Markdown');

interface Props {
    md: string;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.md) {
            return null;
        }
        return Markdown.Factory({
            className: 'rd-copy',
            md: this.props.md
        });
    }
}

export var Factory = React.createFactory(Component);
