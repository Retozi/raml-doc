/// <reference path="../../../typings/references.d.ts" />
require('./NamedParametersStyles.styl');
import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Markdown = require('../general/Markdown');
import Subhead = require('../general/Subhead');

interface Props {
    title: string;
    namedParameters: RamlSpec.NamedParameters;
}

var el = React.createElement;

function LeftContentFactory(name: string, param: RamlSpec.NamedParameter) {
    return [
        el('div', {className: 'rd-namedParameters-name'}, name),
        (param.type) ? el('div', {className: 'rd-namedParameters-type'}, param.type) : null
    ];
}

function RightContentFactory(param: RamlSpec.NamedParameter) {
    return [
        (param.enum) ? el('div', {className: 'rd-namedParameters-enum'}, "enum"): null,
        (param.description) ? el('div', {className: 'rd-namedParameters-desc'}, param.description): null,
    ];
}

function ItemFactory(name: string, param: RamlSpec.NamedParameter) {
    return el('li', {className: 'rd-namedParameters-item'},
        el('div', {className: 'rd-namedParameters-leftContainer'},
            LeftContentFactory(name, param)
        ),
        el('div', {className: 'rd-namedParameters-rightContainer'},
            RightContentFactory(param)
        )
    )
}

function ItemsFactory(namedParameters: RamlSpec.NamedParameters): React.ReactNode {
    return Object.keys(namedParameters).map((name: string) => {
        return ItemFactory(name, namedParameters[name])
    })
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.namedParameters) {
            return null;
        }
        return el('div', {className: 'rd-namedParameters'},
            Subhead.Factory({text: this.props.title}),
            el('ul', {className: 'rd-namedParameters-list'},
                ItemsFactory(this.props.namedParameters)
            )
        );
    }
}

export var Factory = React.createFactory(Component);
