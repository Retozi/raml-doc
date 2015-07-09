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

function DescriptionFactory(md: string): React.ReactNode {
    if (!md) {
        return null;
    }
    return Copy.Factory({md: md});
}

function MethodsFactory(methods: RamlSpec.Method[], uri: string): React.ReactNode {
    if (!methods) {
        return null;
    }
    return methods.map((m: RamlSpec.Method) => Method.Factory({method: m, uri: uri}));
}

function ResourceFactory(resource: RamlSpec.Resource): React.ReactNode {
    if (!resource.description) {
        return null;
    }
    return Section.Factory({title: this.props.resource.displayName || this.props.resource.absoluteUri},
        Block.Factory({
            left: DescriptionFactory(this.props.resource.description)
        })
    );
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.resource.description && !this.props.resource.methods) {
            return null;
        }
        return (
            React.createElement('div', null,
                ResourceFactory(this.props.resource),
                MethodsFactory(this.props.resource.methods, this.props.resource.absoluteUri)
            )
        );
    }
}

export var Factory = React.createFactory(Component);
