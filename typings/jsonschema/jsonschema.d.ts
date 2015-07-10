declare module jsonschema {
    interface Properties {
        [idx: string]: SchemaNode
    }
    interface SchemaNode {
        type?: string | string[];
        $ref?: string;
        description?: string;
        enum?: any[];
        properties?: Properties;
        items?: SchemaNode;
        required?: string[];
        pattern?: string;
        oneOf?: SchemaNode[];
        allOf?: SchemaNode[];
        anyOf?: SchemaNode[];
    }

    type Schema = SchemaNode;
}