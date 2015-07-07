/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Section = require('../general/Section');
import Copy = require('../general/Copy');
import Block = require('../general/Block');

interface Props {
    method: RamlSpec.Method;
}

function DescriptionFactory(md: string) {
    if (!md) {
        return null;
    }
    return Copy.Factory({md: md});
}



export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        console.log(this.props.method)
        return Section.Factory({title: this.props.method.displayName || this.props.method.method.toUpperCase()},
            Block.Factory({
                left: DescriptionFactory(this.props.method.description)
            })
        );
    }
}

export var Factory = React.createFactory(Component);