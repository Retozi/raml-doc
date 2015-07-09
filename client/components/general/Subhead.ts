/// <reference path="../../../typings/references.d.ts" />
require('./SubheadStyles.styl');
import React = require('react');

interface Props {
    text: string;
    inverted?: boolean;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('h3', {
            className: 'rd-subhead',
            'data-inverted': this.props.inverted || false
        }, this.props.text);
    }
}

export var Factory = React.createFactory(Component);
