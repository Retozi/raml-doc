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
        items?: SchemaNode[];
    }

    type Schema = SchemaNode;
}