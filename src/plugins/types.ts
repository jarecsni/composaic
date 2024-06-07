/**
 * Describes a single plugin.
 * This will need to be validated by ajv.
 * In the initial implementation, we will use typescript objects, not json.
 */
export interface PluginDescriptor {
    module: string;
    loadedModule?: object;
    plugin: string;
    version: string;
    description: string;
    extensionPoints?: {
        id: string;
        type: string;
        singleton?: boolean;
    }[];
    extensions?: {
        plugin: string;
        id: string;
        className: string;
        impl?: object;
    }[];
    dependencies?: (string | PluginDescriptor)[];
}

const x: PluginDescriptor = {
    module: 'FooPluginModule',
    plugin: '@foo/bar',
    version: '1.0',
    description: 'bar',
    extensions: [
        {
            plugin: '@foo/baz',
            id: 'qux',
            className: 'path/to/qux',
        },
        {
            plugin: '@foo/baz',
            id: 'qux',
            className: 'path/to/qux',
        },
    ],
    extensionPoints: [
        {
            id: 'baz',
            type: 'qux',
        },
        {
            id: 'baz',
            type: 'qux',
        },
    ],
};
