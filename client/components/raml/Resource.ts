/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Section = require('../general/Section');
import Copy = require('../general/Copy');
import Block = require('../general/Block');
import Method = require('./Method');

interface Props {
    resource: RamlSpec.Resource;
}

function DescriptionFactory(md: string) {
    if (!md) {
        return null;
    }
    return Copy.Factory({md: md});
}

function MethodsFactory(methods: RamlSpec.Method[]) {
    if (!methods) {
        return null;
    }
    return methods.map((m: RamlSpec.Method) => Method.Factory({method: m}));
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.resource.description && !this.props.resource.methods) {
            return null;
        }
        return (
            React.createElement('div', null,
                Section.Factory({title: this.props.resource.displayName || this.props.resource.absoluteUri},
                    Block.Factory({
                        left: DescriptionFactory(this.props.resource.description)
                    })
                ),
                MethodsFactory(this.props.resource.methods)
            )
        );
    }
}

export var Factory = React.createFactory(Component);