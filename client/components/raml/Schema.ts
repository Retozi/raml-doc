/// <reference path="../../../typings/references.d.ts" />
require('./SchemaStyles.styl');
import React = require('react');
import Markdown = require('../general/Markdown');

var el = React.createElement;

interface Props {
    title?: string;
    schema: jsonschema.Schema;
}

function OptionalFactory(required: boolean) {
    if (!required) {
        return el('span', {className: 'rd-schema-optional'}, 'optional ');
    }
}

function TypeFactory(type: string | string[]) {
    if (!type) {
        return null;
    }
    return [el('span', {className: 'rd-schema-type'}, type)];
}


function DescriptionFactory(desc: string) {
    if (!desc) {
        return null;
    }
    return el('div', {className: 'rd-schema-description'}, desc);
}


function PrimitiveFactory(schemaNode: jsonschema.SchemaNode, required: boolean) {
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
        //return ArrayFactory(schemaNode);
    } else {
        return PrimitiveFactory(schemaNode, required);
    }
}

function isRequired(key: string, required: string[]): boolean {
    return (required) ? required.indexOf(key) > -1 : false;
}

function PropertiesFactory(properties: jsonschema.Properties, required: string[]) {
    if (!properties) {
        return null;
    }
    return el('div', {className: 'rd-schema-properties'},
        Object.keys(properties).map((title: string) => {
            return el('div', {className: 'rd-schema-property', key: title}, [
                el('span', {className: 'rd-schema-propertyKey'}, `${title}: `),
                SchemaNodeFactory(properties[title], isRequired(title, required)), '\n'
            ]);
        })
    );
}

function Array(schemaNode: jsonschema.SchemaNode, required: boolean) {
    console.log(schemaNode)
    return el('div', {className: 'rd-schema-array'},
        OptionalFactory(required),
        '[\n    ',
        SchemaNodeFactory(schemaNode.items[0], true),
        '\n]',
        DescriptionFactory(schemaNode.description)
    )
}

function ObjectFactory(schemaNode: jsonschema.SchemaNode, required: boolean) {
    console.log(schemaNode)
    return el('div', {className: 'rd-schema-object'},
        OptionalFactory(required),
        '{\n    ',
        PropertiesFactory(schemaNode.properties, schemaNode.required),
        '\n}',
        DescriptionFactory(schemaNode.description)
    )
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return el('pre', {className: 'rd-schema'},
            SchemaNodeFactory(this.props.schema, true)
        );
    }
}

export var Factory = React.createFactory(Component);