/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import Markdown = require('../general/Markdown');


interface Props {
    title?: string;
    schema: jsonschema.Schema;
}

function DescriptionFactory(description: string) {
    if (!description) {
        return null;
    }
    return Markdown.Factory({className: 'rd-schema-description', md: description});
}

function TitleFactory(title: string) {
    if (!title) {
        return null;
    }
    return React.createElement('div', {className: 'rd-schema-title'}, title);
}

function TypeFactory(type: string | string[]) {
    if (!type) {
        return null;
    }
    return React.createElement('div', {className: 'rd-schema-type'}, type);
}

function SchemaNodeFactory(title: string, schemaNode: jsonschema.SchemaNode): React.ReactNode {
    return React.createElement('div', {className: 'rd-schema-node', key: title},
        TitleFactory(title),
        DescriptionFactory(schemaNode.description),
        TypeFactory(schemaNode.type),
        PropertiesFactory(schemaNode.properties),
        ItemFactory(schemaNode.items)
    )
}

function ItemFactory(items: jsonschema.SchemaNode[]) {
    if (!items) {
        return null;
    }
    return React.createElement('div', {className: 'rd-schema-properties'},
        SchemaNodeFactory('items', items[0])
    );
}

function PropertiesFactory(properties: jsonschema.Properties) {
    if (!properties) {
        return null;
    }
    return React.createElement('div', {className: 'rd-schema-properties'},
        Object.keys(properties).map((title: string) => {
            return SchemaNodeFactory(title, properties[title])
        })
    );
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-schema'},
            SchemaNodeFactory(this.props.title || 'Root', this.props.schema)
        );
    }
}

export var Factory = React.createFactory(Component);