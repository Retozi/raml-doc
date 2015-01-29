var React = require('react');
var Panel = require('./Panel');


var ValidationError = React.createClass({

    render() {
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
        var id = this.props.error.id;
        var header = (typeof id === 'string') ? id : id.join(' ');
        return (
            <Panel header={header} type="default">
                <div className="list-group">
                    {this.renderErrors()}
                </div>
            </Panel>
        );
    }
});


var Errors = React.createClass({
    renderErrors() {
        return this.props.errors.map((e, i) => {
            return <MethodError key={i} error={e}/>;
        });
    },
    render() {
        if (!this.props.errors) {
            return null;
        }
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
