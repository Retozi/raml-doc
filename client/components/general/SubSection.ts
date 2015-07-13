/// <reference path="../../../typings/references.d.ts" />
require('./SubSectionStyles.styl');
import React = require('react');
import Block = require('./Block');

interface Props {
    title: string;
    children?: string;
}

function TitleFactory(title: string): React.ReactNode {
    if (!title) {
        return null;
    }
    return Block.Factory({
        left: React.createElement('h2', {className: 'rd-subSection-title'},
            title
        )
    });
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-subSection'},
            TitleFactory(this.props.title),
            this.props.children
        );
    }
}

export var Factory = React.createFactory(Component);
