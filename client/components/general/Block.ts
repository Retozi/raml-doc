/// <reference path="../../../typings/references.d.ts" />
import React = require('react');

interface Props {
    left?: React.ReactNode;
    right?: React.ReactNode;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-block'},
            React.createElement('div', {className: 'rd-block-content'},
                React.createElement('div', {className: 'rd-block-leftContent'},
                    this.props.left || null
                ),
                React.createElement('div', {className: 'rd-block-rightContent'},
                    this.props.right || null
                )
            )
        );
    }
}

export var Factory = React.createFactory(Component);