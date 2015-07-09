/// <reference path="../../../typings/references.d.ts" />
import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Section = require('../general/Section');
import SubSection = require('../general/SubSection');
import Copy = require('../general/Copy');
import Block = require('../general/Block');
import Schema = require('./Schema');
import Example = require('./Example');
import Code = require('../general/Code');
import NamedParameters = require('./NamedParameters');

interface Props {
    method: RamlSpec.Method;
    uri: string;
}

function DescriptionFactory(md: string): React.ReactNode {
    if (!md) {
        return null;
    }
    return Copy.Factory({md: md});
}

function PayloadBodyFactory(body: RamlSpec.Body) {
    if (!body || !body['application/json']) {
        return null;
    }
    var jsonBody = body['application/json'];
    if (!jsonBody.example && !jsonBody.schema) {
        return null;
    }

    return Block.Factory({
        left: Schema.Factory({schema: jsonBody.parsedSchema.result}),
        right: Example.Factory({example: jsonBody.parsedExample.result})
    })
}


function PayloadSectionFactory(method: RamlSpec.Method): React.ReactNode {
    if (!method || !method.body) {
        return null;
    }
    return SubSection.Factory({title: "Payload Body"},
       PayloadBodyFactory(method.body)
    )
}

function ResponseBodySectionFactory(responses: RamlSpec.Responses): React.ReactNode {
    var res: React.ReactNode[] = [];
    if (!responses) {
        return null;
    }
    Object.keys(responses).forEach((status: string) => {
        var r = responses[status];
        if (r.body && r.body['application/json']) {
            var jsonBody = r.body['application/json'];
            res.push(SubSection.Factory({
                    title: `${status} Body`,
                },
                    Block.Factory({
                        left: Schema.Factory({schema: jsonBody.parsedSchema.result}),
                        right: Example.Factory({example: jsonBody.parsedExample.result})
                    })
            ));
        }
    });
    return res;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return Section.Factory({title: this.props.method.displayName || this.props.method.method.toUpperCase()},
            Block.Factory({
                left: DescriptionFactory(this.props.method.description),
                right: Code.Factory({
                        language: 'http'
                    },
                    `${this.props.method.method.toUpperCase()} ${this.props.uri} HTTP/1.1`
                )
            }),
            Block.Factory({
                left: NamedParameters.Factory({title: 'Query Parameters', namedParameters: this.props.method.queryParameters})
            }),
            PayloadSectionFactory(this.props.method),
            ResponseBodySectionFactory(this.props.method.responses)
        );
    }
}

export var Factory = React.createFactory(Component);