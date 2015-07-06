require('./AppStyles.styl');
import React = require('react');
import RamlSpec = require('../../server/RamlSpec');
import Sidebar = require('./Sidebar');
import Content = require('./Content');

export interface Props {
    socket?: string;
    raml?: RamlSpec.Raml;
}

interface State {
    raml: RamlSpec.Raml;
    validationErrors: RamlSpec.ValidationError[];
}


export class Component extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            raml: null,
            validationErrors: []
        }
    }
    setRamlState(raml: RamlSpec.Raml, validationErrors: RamlSpec.ValidationError[]): void {
        this.setState({
            raml: raml,
            validationErrors: validationErrors
        });
    }

    componentDidMount() {
        if (this.props.socket) {
            console.log("listening to changes in raml files");
            var socket = require('socket.io-client')(this.props.socket);
            socket.on("raml", (d: State) => this.setRamlState(d.raml, d.validationErrors));
        }
    }

    render(): React.ReactNode {
        var raml = this.props.raml || this.state.raml;
        if (!raml) {
            return null;
        }
        return React.createElement('div', {className: "raml-doc"},
            Sidebar.Factory({raml: raml}),
            Content.Factory({raml: raml})
        );
    }
}