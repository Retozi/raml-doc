var React = require('react');
var Panel = require('./Panel');


var ValidationError = React.createClass({

    render() {
        console.log(this.props.error);
        return (
            <div className="list-group-item">
                <pre>
                    <code>
                        {this.props.error.stack || this.props.error.message}
                    </code>
                </pre>
            </div>
        );
    }
});


var MethodError = React.createClass({
    renderErrors() {
        return this.props.error.errors.map((e, i) => {
            return <ValidationError key={i} error={e}/>;
        });
    },
    render() {
        return (
            <Panel header={this.props.error.id.join(' ')} type="default">
                <div className="list-group">
                    {this.renderErrors()}
                </div>
            </Panel>
        );
    }
});


var Errors = React.createClass({
    renderErrors() {
        return this.props.errors.map((e) => {
            return <MethodError key={e.id.join('/')} error={e}/>;
        });
    },
    render() {
        if (!this.props.errors) {
            return null;
        }
        console.log(this.props);
        return (
            <Panel header="Validation Errors" type="danger">
                <div className="panel-body">
                    {this.renderErrors()}
                </div>
            </Panel>
        );
    }
});


module.exports = Errors;
