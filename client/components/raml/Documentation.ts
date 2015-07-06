import React = require('react');
import RamlSpec = require('../../../server/RamlSpec');
import Copy = require('../general/Copy');
import Section = require('../general/Section');
import Block = require('../general/Block');

interface ItemProps {
    title: string;
    content: string;
}

class DocumentationItem extends React.Component<ItemProps, void> {
    render(): React.ReactNode {
        return Section.Factory({title: this.props.title},
            Block.Factory({
                left: Copy.Factory({
                    md: this.props.content
                })
            })
        );
    }
}

var DocumentationItemFactory = React.createFactory(DocumentationItem);

function ItemFactory(props: Props) {
    return props.documentation.map((d: RamlSpec.Documentation): React.ReactNode => {
        return DocumentationItemFactory({
            key: d.title,
            title: d.title,
            content: d.content
        });
    });
}

export interface Props {
    documentation: RamlSpec.Documentation[];
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        if (!this.props.documentation) {
            return null;
        }
        return React.createElement('div', {className: "rd-documentation"},
            ItemFactory(this.props)
        );
    }
}

export var Factory = React.createFactory(Component);