var React = require('react');
var Description = require('./Description');

var HomeContent = React.createClass({
    renderDescriptions() {
        return this.props.raml.documentation.map((d, i) => {
            return <div style={{marginBottom: 40}}>
                <h2>{d.title}</h2>
                <Description md={d.content} key={i}/>
            </div>;
        });
    },
    render() {
        if (!this.props.raml.documentation) {
            return null;
        }
        return (
            <div>
                {this.renderDescriptions()}
            </div>
        );
    }
});

module.exports = HomeContent;
