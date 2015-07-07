/// <reference path="../../../typings/references.d.ts" />
require('./SectionStyles.styl');
import React = require('react');

interface Props {
    title: string;
    children?: string;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-section'},
            React.createElement('h1', {className: 'rd-section-title'},
                this.props.title
            ),
            this.props.children
        );
    }
}

export var Factory = React.createFactory(Component);