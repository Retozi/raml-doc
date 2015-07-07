require('./ContentStyles.styl');
import React = require('react');
import RamlSpec = require('../../server/RamlSpec');
import Documentation = require('./raml/Documentation');
import GlobalSchemas = require('./raml/GlobalSchemas');
import Resources = require('./Resources');

export interface Props {
    raml: RamlSpec.Raml;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: "rd-content"},
            React.createElement('div', {className: "rd-content-wrapper"},
                React.createElement('div', {className: 'rd-content-blackBackground'}),
                Documentation.Factory({documentation: this.props.raml.documentation}),
                GlobalSchemas.Factory({parsedSchemas: this.props.raml.parsedSchemas}),
                Resources.Factory({resources: this.props.raml.resources})
            )
        );
    }
}

export var Factory = React.createFactory(Component);