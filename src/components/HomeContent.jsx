var React = require('react');
var Description = require('./Description');
var Code = require('./Code');

var HomeContent = React.createClass({
    renderDescriptions() {
        return this.props.raml.documentation.map((d, i) => {
            return <section key={i}>
                <h2 key="header">{d.title}</h2>
                <Description md={d.content} key={i}/>
            </section>;
        });
    },
    renderCustomTypes() {
        if (this.props.raml.schemas) {
            var types = [];
            this.props.raml.schemas.forEach((s) => {
                Object.keys(s).forEach((t, i) => {
                    types.push(<h3 key={"header" + i}>{t}</h3>);
                    types.push(<Code key={"body"+ i}>{s[t]}</Code>);
                });
            });
            return <section>
                <h2 style={{marginBottom: 20}}>Custom Schema Types</h2>
                {types}
            </section>;
        }

    },
    render() {
        if (!this.props.raml || !this.props.raml.documentation) {
            return null;
        }
        return (
            <div>
                {this.renderDescriptions()}
                {this.renderCustomTypes()}
            </div>
        );
    }
});

module.exports = HomeContent;
