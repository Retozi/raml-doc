/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Section = require('../general/Section');
import Copy = require('../general/Copy');

interface Props {
    resource: RamlSpec.Resource;
}

function DescriptionFactory(md: string) {
    if (!md) {
        return null;
    }
    return Copy.Factory({md: this.props.resource.description});
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.resource.description && !this.props.resource.methods) {
            return null;
        }
        return Section.Factory({title: this.props.resource.displayName || this.props.resource.absoluteUri},
            DescriptionFactory(this.props.resource.description)
        )
    }
}

export var Factory = React.createFactory(Component);