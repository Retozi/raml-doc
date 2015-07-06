/// <reference path="../../typings/references.d.ts" />
import React = require('react');
import Resource = require('./raml/Resource');
import RamlSpec = require('../../server/RamlSpec');

interface Props {
    resources: RamlSpec.Resource[];
}

function ResourcesFactory(resources: RamlSpec.Resource[]) {
    var res: React.ReactNode[] = [];
    function walk(r: RamlSpec.Resource[]) {
        r.forEach((r: RamlSpec.Resource) => {
            res.push(Resource.Factory({key: r.absoluteUri, resource: r}));
            if (r.resources) {
                walk(r.resources);
            }
        });
    }
    walk(resources);
    return res;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: 'rd-resources'},
            ResourcesFactory(this.props.resources)
        );
    }
}

export var Factory = React.createFactory(Component);