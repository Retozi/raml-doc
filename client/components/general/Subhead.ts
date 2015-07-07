/// <reference path="../../../typings/references.d.ts" />
require('./SubheadStyles.styl');
import React = require('react');
import Markdown = require('./Markdown');

interface Props {
    text: string;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('h3', {
            className: 'rd-subhead'
        }, this.props.text);
    }
}

export var Factory = React.createFactory(Component);