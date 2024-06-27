/**
 * Describes a single plugin.
 * This will need to be validated by ajv.
 * In the initial implementation, we will use typescript objects, not json.
 */
export interface PluginDescriptor {
    module: string;
    package: string;
    class: string;
    loadedClass?: object;
    loadedModule?: object;
    plugin: string;
    version: string;
    description: string;
    extensionPoints?: {
        id: string;
        type: string;
        singleton?: boolean;
        impl?: { plugin: string; extensionImpl: object }[];
    }[];
    extensions?: {
        plugin: string;
        id: string;
        className: string;
        impl?: object;
    }[];
    dependencies?: (string | PluginDescriptor)[];
}

export abstract class Plugin {
    initialised = false;
    pluginDescriptor: PluginDescriptor = {} as PluginDescriptor;
    start(): void {}
    stop(): void {}
    init(pluginDescriptor: PluginDescriptor): void {
        if (this.initialised) {
            throw new Error('Plugin already initialised');
        }
        this.pluginDescriptor = pluginDescriptor;
        this.initialised = true;
    }
    getPluginDescriptor(): PluginDescriptor {
        return this.pluginDescriptor;
    }
}

export type ClassConstructor<T = any> = new (...args: any[]) => T;

const x: PluginDescriptor = {
    module: 'FooPluginModule',
    plugin: '@foo/bar',
    package: 'foo',
    version: '1.0',
    class: 'FooPlugin',
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
