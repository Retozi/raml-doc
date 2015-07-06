import React = require('react');
import RamlSpec = require('../../server/RamlSpec');

export interface Props {
    raml: RamlSpec.Raml;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: "rd-sideBar"});
    }
}

export var Factory = React.createFactory(Component);