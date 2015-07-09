/// <reference path="../../../typings/references.d.ts" />

import React = require('react');
import Code = require('../general/Code');
import Subhead = require('../general/Subhead');

interface Props {
    title?: string;
    example: Object;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.example) {
            return null;
        }
        return React.createElement('div', {className: "rd-example"},
            Subhead.Factory({text: this.props.title || "Example", inverted: true}),
            Code.Factory({language: "json"},
                JSON.stringify(this.props.example, null, 2)
            )
        );
    }
}

export var Factory = React.createFactory(Component);
