/// <reference path="../../../typings/references.d.ts" />
require('./SchemaStyles.styl');
import React = require('react');
import Subhead = require('../general/Subhead');
import _ = require('lodash');

var el = React.createElement;

interface Props {
    title?: string;
    id?: string;
    schema: jsonschema.Schema;
}

function OptionalFactory(required: boolean): React.ReactNode {
    if (!required) {
        return el('span', {className: 'rd-schema-optional', key: 'optional'}, ' optional ');
    }
}

function TypeFactory(type: string | string[]): React.ReactNode  {
    if (!type) {
        return null;
    }
    var typeString: string;
    if (_.isArray(type)) {
        typeString = (<string[]> type).join(', ')
    } else {
        typeString = <string> type;
    }
    return [el('span', {className: 'rd-schema-type', key: 'type'}, typeString)];
}


function DescriptionFactory(desc: string): React.ReactNode  {
    if (!desc) {
        return null;
    }
    return el('div', {className: 'rd-schema-description', key: 'desc'}, desc);
}

function RefFactory($ref: string): React.ReactNode {
    var ref = $ref.slice(1, $ref.length);
    return el('a', {
            className: 'rd-schema-ref',
            href: '#global-types/' + ref
        },
        ref
    );
}

function EnumFactory(e: any[]): React.ReactNode {
    if (!e) {
        return null;
    }
    return el('div', {className: 'rd-schema-enum', key: 'enum'},
        `enum: ${e.join(', ')}`
    )
}

function PatternFactory(pattern: string): React.ReactNode {
    if (!pattern) {
        return null;
    }
    return el('div', {className: 'rd-schema-pattern', key: 'pattern'},
        `pattern: ${pattern}`
    )
}


function PrimitiveFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode  {
    return el('div', {className: 'rd-schema-primitive'},
        TypeFactory(schemaNode.type),
        OptionalFactory(required),
        EnumFactory(schemaNode.enum),
        PatternFactory(schemaNode.pattern),
        DescriptionFactory(schemaNode.description)
    );
}

function OneOfFactory(oneOf: jsonschema.SchemaNode[]): React.ReactNode {
    var res: React.ReactNode[] = [];
    oneOf.forEach((t: jsonschema.SchemaNode): void => {
        res.push(SchemaNodeFactory(t, true));
        res.push(', ')
    })
    return res.slice(0, res.length -1);
}

function SchemaNodeFactory(schemaNode: jsonschema.SchemaNode, required: boolean): React.ReactNode {
    if(schemaNode.oneOf) {
        return OneOfFactory(schemaNode.oneOf)
    } else if (schemaNode.type === 'object') {
        return ObjectFactory(schemaNode, required);
    } else if (schemaNode.type === 'array') {
        return ArrayFactory(schemaNode, required);
    } else if (schemaNode.$ref) {
        return RefFactory(schemaNode.$ref);
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
            '[ ',
            SchemaNodeFactory(schemaNode.items, true),
            ' ]',
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
            el('div', {className: 'rd-schema', id: this.props.id},
                Subhead.Factory({text: this.props.title || "Schema"}),
                el('pre', {className: 'rd-schema-definition'},
                    SchemaNodeFactory(this.props.schema, true)
                )
            )
        );
    }
}

export var Factory = React.createFactory(Component);
