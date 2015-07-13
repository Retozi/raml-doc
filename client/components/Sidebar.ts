require('./SidebarStyles.styl');
import Utils = require('./Utils');
import React = require('react');
import RamlSpec = require('../../server/RamlSpec');

export interface Props {
    raml: RamlSpec.Raml;
}

var LEVEL_PADDING = 20;

function ResourcePathFactory(p: ResourceItemProps): React.ReactNode {
    return React.createElement('div', {
        key: p.absUri,
        className: 'rd-sidebar-resourcePath',
        'data-root': p.level === 0,
        style: {paddingLeft: p.level * LEVEL_PADDING}
    }, p.relUri);
}

function ResourceLinkFactory(p: ResourceItemProps): React.ReactNode {
    var urlId = '#' + Utils.urlToId(p.absUri);
    return React.createElement('div', {
            className: 'rd-sidebar-resourceLink',
            'data-root': p.level === 0,
            'data-beforeislast': p.beforeIsLast,
            style: {paddingLeft: p.level * LEVEL_PADDING}
        },
            React.createElement('a', {
                className: 'rd-sidebar-resourceLinkResource',
                key: p.absUri,
                href: urlId
            }, p.relUri),
            p.methods.map((m: RamlSpec.Method) => {
                return React.createElement('a', {
                    className: 'rd-sidebar-resourceLinkMethod',
                    href: urlId + '-' + m.method
                }, m.method.toUpperCase());
            })
    );
}

interface ResourceItemProps {
    absUri: string;
    relUri: string;
    level: number;
    methods: RamlSpec.Method[];
    beforeIsLast: boolean;
}

function ResourcesLinksFactory(raml: RamlSpec.Raml): React.ReactNode {
    if (!raml || !raml.resources) {
        return null;
    }
    var res: React.ReactNode[] = [];

    function walk(resources: RamlSpec.Resource[], level: number): void {
        resources.forEach((r: RamlSpec.Resource, i: number) => {
            var lastEl = <React.ReactElement<any>> res[res.length - 1];

            var props: ResourceItemProps = {
                absUri: r.absoluteUri,
                relUri: r.relativeUri,
                level: level,
                methods: r.methods || [],
                beforeIsLast: (lastEl) ? lastEl.props.style.paddingLeft > level * LEVEL_PADDING : false
            };
            if (!r.description && ! r.methods) {
                res.push(ResourcePathFactory(props));
            } else {
                res.push(ResourceLinkFactory(props));
            }
            if (r.resources) {
                walk(r.resources, level + 1);
                return;
            }
        });
    }
    walk(raml.resources, 0);
    return res;
}

export class Component extends React.Component<Props, void> {

    render(): React.ReactNode {
        return React.createElement('div', {className: "rd-sideBar"},
            ResourcesLinksFactory(this.props.raml)
        );
    }
}

export var Factory = React.createFactory(Component);
