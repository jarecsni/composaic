import {
    Boolean,
    Number,
    Optional,
    String,
    Literal,
    Array,
    Tuple,
    Record,
    Union,
    Static,
    Unknown,
} from 'runtypes';

/**
 * Describes a single plugin.
 * This will need to be validated by ajv.
 * In the initial implementation, we will use typescript objects, not json.
 */
export interface PluginDescriptor {
    remoteName?: string;
    remoteURL?: string;
    bundleFile?: string;
    remoteModuleName?: string;
    module: string;
    package: string;
    class: string;
    loadedClass?: object;
    loadedModule?: { [exportedModule: string]: object };
    plugin: string;
    load?: 'deferred';
    version: string;
    description: string;
    pluginInstance?: Plugin;
    extensionPoints?: {
        id: string;
        type: string;
        singleton?: boolean;
        impl?: { plugin: string; extensionImpl: object; meta?: object }[];
    }[];
    extensions?: {
        plugin: string;
        id: string;
        className: string;
        impl?: object;
        meta?: object;
    }[];
    dependencies?: (string | PluginDescriptor)[];
}

const PluginManifestExtensionPoints = Record({
    id: String,
    type: String,
});
export type PluginManifestExtensionPoints = Static<
    typeof PluginManifestExtensionPoints
>;

const PluginManifestExtension = Record({
    plugin: String,
    id: String,
    className: String,
    meta: Optional(Array(Unknown)),
});
export type PluginManifestExtension = Static<typeof PluginManifestExtension>;

const PluginManifestPluginDefinition = Record({
    package: String,
    module: String,
    class: String,
    plugin: String,
    load: Optional(Literal('deferred')),
    version: String,
    description: String,
    extensionPoints: Optional(Array(PluginManifestExtensionPoints)),
    extensions: Optional(Array(PluginManifestExtension)),
});
export type PluginManifestPluginDefinition = Static<
    typeof PluginManifestPluginDefinition
>;

const PluginManifestPlugin = Record({
    remote: Record({
        name: String,
        bundleFile: String,
    }),
    definitions: Array(PluginManifestPluginDefinition),
});
export type PluginManifestPlugin = Static<typeof PluginManifestPlugin>;

const PluginManifest = Record({
    plugins: Array(PluginManifestPlugin),
});
export type PluginManifest = Static<typeof PluginManifest>;

export abstract class Plugin {
    initialised = false;
    _started = false;
    stopped = false;
    pluginDescriptor: PluginDescriptor = {} as PluginDescriptor;
    extensionsPoints: {
        [extensionPointId: string]: { plugin: string; extensionImpl: object }[];
    } = {};
    extensions: {
        [id: string]: object;
    } = {};
    get started(): boolean {
        return this._started;
    }
    async start(): Promise<void> {
        console.log('Starting plugin', this.pluginDescriptor.plugin);
        this._started = true;
    }
    async stop(): Promise<void> {
        console.log('Stopping plugin', this.pluginDescriptor.plugin);
        this.stopped = true;
    }
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
    connectExtensions(
        extensionPointId: string,
        extensions: {
            plugin: string;
            extensionImpl: { plugin: string; impl: object };
        }[]
    ): void {
        if (this.initialised) {
            throw new Error('Plugin already initialised');
        }
        this.extensionsPoints[extensionPointId] = extensions;
    }
    protected getConnectedExtensions(
        extensionPointId: string
    ): { plugin: string; extensionImpl: object; meta?: object }[] {
        return this.extensionsPoints[extensionPointId];
    }
    setExtensionImplementation(
        plugin: string,
        extensionPointId: string,
        extensionImpl: object
    ): void {
        if (this.initialised) {
            throw new Error('Plugin already initialised');
        }
        this.extensions[plugin + '::' + extensionPointId] = extensionImpl;
    }
    protected getExtensionImpl(plugin: string, extensionId: string): object {
        return this.extensions[plugin + '::' + extensionId];
    }
    getModule(moduleName: string): object {
        return this.pluginDescriptor.loadedModule![moduleName];
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
