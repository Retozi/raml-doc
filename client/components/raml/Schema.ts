/// <reference path="../../../typings/references.d.ts" />
require('./SchemaStyles.styl');
import React = require('react');
import Subhead = require('../general/Subhead');


var el = React.createElement;

interface Props {
    title?: string;
    schema: jsonschema.Schema;
}

function OptionalFactory(required: boolean): React.ReactNode {
    if (!required) {
        return el('span', {className: 'rd-schema-optional', key: 'optional'}, 'optional ');
    }
}

function TypeFactory(type: string | string[]): React.ReactNode  {
    if (!type) {
        return null;
    }
    return [el('span', {className: 'rd-schema-type', key: 'type'}, type)];
}


function DescriptionFactory(desc: string): React.ReactNode  {
    if (!desc) {
        return null;
    }
    return el('div', {className: 'rd-schema-description', key: 'desc'}, desc);
}


function PrimitiveFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode  {
    return el('div', {className: 'rd-schema-primitive'},
        OptionalFactory(required),
        TypeFactory(schemaNode.type),
        DescriptionFactory(schemaNode.description)
    );
}

function SchemaNodeFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode {
    if (schemaNode.type === 'object') {
        return ObjectFactory(schemaNode, required);
    } else if (schemaNode.type === 'array') {
        return ArrayFactory(schemaNode, required);
    } else {
        return PrimitiveFactory(schemaNode, required);
    }
}

function isRequired(key: string, required: string[]): boolean {
    return (required) ? required.indexOf(key) > -1 : false;
}

function PropertiesFactory(properties: jsonschema.Properties, required: string[]): React.ReactNode {
    if (!properties) {
        return null;
    }
    return el('div', {className: 'rd-schema-properties', key: 'props'},
        Object.keys(properties).map((title: string) => {
            return el('div', {className: 'rd-schema-property', key: title}, [
                el('span', {className: 'rd-schema-propertyKey', key: 'key'}, `${title}: `),
                SchemaNodeFactory(properties[title], isRequired(title, required)), '\n'
            ]);
        })
    );
}

function ArrayFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode {
    if (schemaNode.items.type === 'object') {
        return el('div', {className: 'rd-schema-array'},
            OptionalFactory(required),
            '[\n  {\n    ',
            PropertiesFactory(schemaNode.items.properties, schemaNode.items.required),
            '\n  }, {\n    ...\n  }\n]',
            DescriptionFactory(schemaNode.description)
        );
    } else {
        return el('div', {className: 'rd-schema-array'},
            OptionalFactory(required),
            '[\n  ',
            SchemaNodeFactory(schemaNode.items, true),
            '\n  , \n    ...\n  \n]',
            DescriptionFactory(schemaNode.description)
        );
    }
}


function ObjectFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode {
    return el('div', {className: 'rd-schema-object'},
        OptionalFactory(required),
        '{\n  ',
        PropertiesFactory(schemaNode.properties, schemaNode.required),
        '\n}',
        DescriptionFactory(schemaNode.description)
    );
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.schema) {
            return null;
        }
        return (
            el('div', {className: 'rd-schema'},
                Subhead.Factory({text: this.props.title || "Schema"}),
                el('pre', {className: 'rd-schema-definition'},
                    SchemaNodeFactory(this.props.schema, true)
                )
            )
        );
    }
}

export var Factory = React.createFactory(Component);
