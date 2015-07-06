/// <reference path="../../../typings/references.d.ts" />

import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Section = require('../general/Section');
import Schema = require('./Schema');

interface Props {
    parsedSchemas: RamlSpec.GlobalTypes;
}

function SchemasFactory(parsedSchemas: RamlSpec.GlobalTypes) {
    if (!parsedSchemas) {
        return null;
    }
    var res: React.ReactNode[] = []
    Object.keys(parsedSchemas).forEach((title: string) => {
        res.push(
            Schema.Factory({
                key: title,
                title: title,
                schema: parsedSchemas[title]
            })
        )
    })
    return res;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return Section.Factory({title: "Global Types"},
            SchemasFactory(this.props.parsedSchemas)
        );
    }
}

export var Factory = React.createFactory(Component);