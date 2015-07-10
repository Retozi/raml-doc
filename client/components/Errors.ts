/// <reference path="../../typings/references.d.ts" />

import React = require('react');
import RamlSpec = require('../../server/RamlSpec');
import Code = require('./general/Code');

interface Props {
    errors: RamlSpec.ValidationError[]
}

function ErrorFactory(error: RamlSpec.ValidationError) {
    var m = error.message;
    try {
        m = JSON.stringify(JSON.parse(m), null, 2)
    } catch (e) {

    }
    return Code.Factory({language: 'text'},
        `
        ${error.url}
        ${error.method}
        ${error.status}
        ${m}
        `
    );
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-errors'},
            this.props.errors.map((e: RamlSpec.ValidationError) => ErrorFactory(e))
        );
    }
}

export var Factory = React.createFactory(Component);
