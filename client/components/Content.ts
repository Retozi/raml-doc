require('./ContentStyles.styl');
import React = require('react');
import RamlSpec = require('../../server/RamlSpec');
import Documentation = require('./raml/Documentation');
import GlobalSchemas = require('./raml/GlobalSchemas');
import Resources = require('./Resources');
import Errors = require('./Errors');

export interface Props {
    raml: RamlSpec.Raml;
    errors: RamlSpec.ValidationError[];
}

function DocFactory(raml: RamlSpec.Raml) {
    if (!raml) {
        return null;
    }
    return [
        Documentation.Factory({documentation: raml.documentation}),
        GlobalSchemas.Factory({parsedSchemas: raml.parsedSchemas}),
        Resources.Factory({resources: raml.resources})
    ]
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: "rd-content"},
            React.createElement('div', {className: "rd-content-wrapper"},
                React.createElement('div', {className: 'rd-content-blackBackground'}),
                Errors.Factory({errors: this.props.errors}),
                DocFactory(this.props.raml)
            )
        );
    }
}

export var Factory = React.createFactory(Component);
