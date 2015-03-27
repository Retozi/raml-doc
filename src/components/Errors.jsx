"use strict";

var React = require('react');
var Panel = require('./Panel');


var MethodError = React.createClass({
    makeHeader() {
        var e = this.props.error;
        var url = e.url;
        var method = e.method || '';
        var status = e.status || '';
        return [url, method.toUpperCase(), status].join(' ');
    },
    render() {
        return (
            <Panel header={this.makeHeader()} type="default">
                <div className="list-group">
                    <div className="list-group-item">
                        <pre>
                            <code>
                                {this.props.error.message}
                            </code>
                        </pre>
                    </div>
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
