import {
    ClassConstructor,
    Extension,
    ExtensionPoint,
    Plugin,
    PluginDescriptor,
} from './types';

// import all core plugins statically
import * as logger from './impl/logger/index.js';
import * as navbar from './impl/navbar/index.js';
import * as signals from './impl/signals/index.js';
import * as views from './impl/views/index.js';
import * as bar from './impl/bar/BarPluginModule.js';
import * as baz from './impl/baz/BazPluginModule.js';
import { RemoteModuleLoaderService } from '../services/RemoteModuleLoaderService.js';

const moduleMap: { [key: string]: object } = {
    'logger/index': logger,
    'navbar/index': navbar,
    'signals/index': signals,
    'views/index': views,
    'bar/BarPluginModule': bar,
    'baz/BazPluginModule': baz,
};

export const loadCorePlugin = async (pluginDescriptor: PluginDescriptor): Promise<object | undefined> => {
    return Promise.resolve(moduleMap[`${pluginDescriptor.package}/${pluginDescriptor.module}`]);
};

/**
 * The `PluginManager` class is responsible for managing plugins in the application.
 * It provides methods to add, load, start, and get plugins.
 */
export class PluginManager {
    protected static instance: PluginManager;
    private registry: { [key: string]: any } = {};

    protected constructor() { }

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    /**
     * Add an array of plugin definitions to the registry
     * @param plugins - an array of plugin definitions
     */
    async addPluginDefinitions(plugins: PluginDescriptor[]) {
        await Promise.all(
            plugins.map(async (plugin) => {
                const existingPlugin = this.registry[plugin.plugin];
                if (!existingPlugin) {
                    await this.addPlugin(plugin);
                } else {
                    console.log(
                        `Plugin with ID ${plugin.plugin} already exists, ignoring request to add it again to the registry`
                    );
                }
            })
        );
    }

    /**
     * Add a plugin definition to the registry
     * @param pluginDescriptor - a plugin definition
     */
    addPlugin(pluginDescriptor: PluginDescriptor) {
        pluginDescriptor.dependencies = [];
        if (pluginDescriptor.extensions) {
            pluginDescriptor.extensions.map((extension) => {
                if (extension.plugin !== 'self') {
                    // Add this plugin as a dependency to the plugin offering the extension point
                    const targetPluginDescriptor =
                        this.registry[extension.plugin];
                    targetPluginDescriptor!.dependencies!.push(
                        pluginDescriptor
                    );
                    // Also add the plugin offering the extension point as a dependency to this plugin
                    pluginDescriptor.dependencies!.push(
                        targetPluginDescriptor!
                    );
                }
            });
        }
        this.registry[pluginDescriptor.plugin] = pluginDescriptor;
    }

    /**
     * Load a plugin by name
     * @param pluginName - the name of the plugin to load
     * @param dependingPlugin - the name of the plugin that depends on the plugin to load
     */
    protected async loadPlugin(
        pluginName: string,
        dependingPlugin?: string
    ): Promise<Plugin | null> {
        const pluginDescriptor = this.registry[pluginName];
        if (!pluginDescriptor) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
        const deferred =
            pluginDescriptor.load === 'deferred' && !!dependingPlugin;

        if (pluginDescriptor.pluginInstance) {
            return pluginDescriptor.pluginInstance;
        }
        if (pluginDescriptor.dependencies) {
            for (const dependency of pluginDescriptor.dependencies) {
                const pluginToLoad = (dependency as PluginDescriptor).plugin;
                if (pluginToLoad === dependingPlugin) {
                    continue;
                }
                await this.loadPlugin(
                    (dependency as PluginDescriptor).plugin,
                    pluginDescriptor.plugin
                );
            }
        }
        if (deferred) {
            console.log('Deferring loading of plugin', pluginName);
        } else {
            if (!pluginDescriptor.loadedModule) {
                try {
                    pluginDescriptor.loadedModule = await pluginDescriptor.loader(pluginDescriptor);
                    console.log(
                        `[composaic] Loaded plugin ${pluginDescriptor.plugin}`
                    );
                } catch (error) {
                    console.error(
                        `[composaic] Failed to load plugin ${pluginDescriptor.plugin}`,
                        error
                    );
                    return null;
                }
            }
            if (pluginDescriptor.loadedModule) {
                pluginDescriptor.loadedClass =
                    pluginDescriptor.loadedModule![
                    pluginDescriptor.class as keyof typeof pluginDescriptor.loadedModule
                    ];
            } else {
                console.error(
                    `[composaic] No module loaded for plugin ${pluginDescriptor.plugin}`
                );
            }

        }
        if (pluginDescriptor.extensions) {
            for (const extension of pluginDescriptor.extensions) {
                if (!deferred) {
                    const ExtensionImpl = pluginDescriptor.loadedModule![
                        extension.className as keyof typeof pluginDescriptor.loadedModule
                    ] as ClassConstructor;
                    extension.impl = new ExtensionImpl();
                }
                const targetPlugin =
                    extension.plugin === 'self'
                        ? pluginDescriptor
                        : this.registry[extension.plugin];
                if (!targetPlugin) {
                    console.error(
                        `Plugin with ID ${extension.plugin} not found for extension ${extension.id}`
                    );
                    continue;
                }
                // look up the extension point in the targetPlugin matching the extension.id
                const extensionPoint = targetPlugin.extensionPoints!.find(
                    (ep: any) => ep.id === extension.id
                );
                // add the extension.impl into the targetPlugins's extensionPoint.impl array initialising it if necessary
                if (extensionPoint) {
                    if (!extensionPoint!.impl) {
                        extensionPoint!.impl = [];
                    }
                    if (
                        !extensionPoint!.impl!.find(
                            (e: any) => e.plugin === pluginDescriptor.plugin
                        )
                    ) {
                        extensionPoint!.impl!.push({
                            plugin: pluginDescriptor.plugin,
                            extensionImpl: extension.impl,
                            meta: extension.meta,
                        });
                    }
                } else {
                    console.warn(
                        'Extension point not found',
                        targetPlugin.plugin,
                        extension.id
                    );
                }
            }
        }

        let plugin: Plugin | null = null;

        if (!deferred) {
            const PluginClass =
                pluginDescriptor.loadedClass! as ClassConstructor;
            plugin = new PluginClass();
            pluginDescriptor.extensionPoints?.forEach(
                (extensionPoint: ExtensionPoint) => {
                    plugin!.connectExtensions(
                        extensionPoint.id,
                        extensionPoint.impl!
                    );
                }
            );

            pluginDescriptor.extensions?.forEach((extension: Extension) => {
                plugin!.setExtensionImplementation(
                    extension.plugin,
                    extension.id,
                    extension.impl!
                );
            });

            plugin!.init(pluginDescriptor);
            pluginDescriptor.pluginInstance = plugin as Plugin;
        }

        return plugin;
    }

    async loadRemotePluginModule(
        url: string,
        name: string,
        bundleFile: string,
        moduleName: string
    ): Promise<object | undefined> {
        return RemoteModuleLoaderService.getInstance().loadRemoteModule({
            url,
            name,
            bundleFile,
            moduleName,
        });
    }

    protected async startPlugin(plugin: Plugin, dependingPlugin?: Plugin) {
        if (plugin.started) {
            return;
        }
        if (plugin.pluginDescriptor.dependencies) {
            Promise.all(
                plugin.pluginDescriptor.dependencies.map(async (dependency) => {
                    if ((dependency as PluginDescriptor).load === 'deferred') {
                        console.log(
                            'Deferring starting of plugin with load=deferred',
                            plugin.pluginDescriptor.plugin
                        );
                    } else {
                        const pluginToLoad = (dependency as PluginDescriptor)
                            .plugin;
                        if (
                            pluginToLoad !==
                            dependingPlugin?.pluginDescriptor.plugin
                        ) {
                            await this.startPlugin(
                                (dependency as PluginDescriptor)
                                    .pluginInstance!,
                                plugin
                            );
                        }
                    }
                })
            );
        }
        await plugin.start();
    }

    /**
     * Get a plugin by name
     *
     * @param pluginName
     * @returns the plugin instance. If the plugin is not loaded, it will be loaded.
     */
    async getPlugin(pluginName: string): Promise<Plugin> {
        try {
            const pluginDescriptor = await this.registry[pluginName];
            if (!pluginDescriptor) {
                throw new Error(`Plugin with ID ${pluginName} not found`);
            }
            if (!pluginDescriptor.pluginInstance) {
                await this.loadPlugin(pluginName);
            }
            await this.startPlugin(pluginDescriptor.pluginInstance!);
            return pluginDescriptor.pluginInstance!;
        } catch (error) {
            console.error(`Error getting plugin: ${pluginName}`, error);
            throw error;
        }
    }

    clear() {
        this.registry = {};
    }

    getNumberOfPlugins(): number {
        return Object.keys(this.registry).length;
    }

    getPluginIds(): string[] {
        return Object.keys(this.registry);
    }
}
