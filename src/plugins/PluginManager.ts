import { ClassConstructor, Plugin, PluginDescriptor } from './types';
import { EventService } from '../services/EventService';
import { PluginRegistryService } from '../services/PluginRegistryService';

/**
 * The `PluginManager` class is responsible for managing plugins in the application.
 * It provides methods to add, load, start, and get plugins.
 */
export class PluginManager {
    protected static instance: PluginManager;

    protected constructor() {}

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    async getPluginFromRegistry(
        pluginName: string
    ): Promise<PluginDescriptor | null> {
        return await new Promise((resolve) => {
            EventService.getInstance().emit('@composaic.getPlugin', {
                pluginName,
                resolve,
            });
        });
    }

    async addPluginToRegistry(pluginDescriptor: PluginDescriptor) {
        await new Promise((resolve) => {
            EventService.getInstance().emit('@composaic.addPlugin', {
                pluginDescriptor,
                resolve,
            });
        });
    }

    /**
     * Add an array of plugin definitions to the registry
     * @param plugins - an array of plugin definitions
     */
    async addPluginDefinitions(plugins: PluginDescriptor[]) {
        await Promise.all(
            plugins.map(async (plugin) => {
                const existingPlugin = await this.getPluginFromRegistry(
                    plugin.plugin
                );
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
    async addPlugin(pluginDescriptor: PluginDescriptor) {
        pluginDescriptor.dependencies = [];
        if (pluginDescriptor.extensions) {
            await Promise.all(
                pluginDescriptor.extensions.map(async (extension) => {
                    if (extension.plugin !== 'self') {
                        // Add this plugin as a dependency to the plugin offering the extension point
                        const targetPluginDescriptor =
                            await this.getPluginFromRegistry(extension.plugin);
                        targetPluginDescriptor!.dependencies!.push(
                            pluginDescriptor
                        );
                        // Also add the plugin offering the extension point as a dependency to this plugin
                        pluginDescriptor.dependencies!.push(
                            targetPluginDescriptor!
                        );
                    }
                })
            );
        }
        await this.addPluginToRegistry(pluginDescriptor);
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
        const pluginDescriptor = await this.getPluginFromRegistry(pluginName);
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
                if (!pluginDescriptor.remoteURL) {
                    // load local module
                    try {
                        // Production mode where we run the composaic project as the main web application
                        pluginDescriptor.loadedModule = await import(
                            `./impl/${pluginDescriptor.package}/${pluginDescriptor.module}.ts`
                        );
                    } catch (error) {
                        // To support local development, when the plugin project installs composaic as an npm package
                        pluginDescriptor.loadedModule = await import(
                            /* @vite-ignore */
                            `/node_modules/composaic/lib/plugins/impl/${pluginDescriptor.package}/${pluginDescriptor.module}.js`
                        );
                    }
                } else {
                    // load remote module using module federation
                    // FIXME
                    // @ts-expect-error - we'll clear this up
                    pluginDescriptor.loadedModule =
                        await this.loadRemotePluginModule(
                            pluginDescriptor.remoteURL,
                            pluginDescriptor.remoteName!,
                            pluginDescriptor.bundleFile!,
                            pluginDescriptor.remoteModuleName!
                        );
                    if (!pluginDescriptor.loadedModule) {
                        console.error(
                            `[composaic] Failed to load remote plugin ${pluginDescriptor.plugin}`
                        );
                        return null;
                    } else {
                        console.log(
                            `[composaic] Loaded remote plugin ${pluginDescriptor.plugin}`
                        );
                    }
                }
            }
            pluginDescriptor.loadedClass =
                pluginDescriptor.loadedModule![
                    pluginDescriptor.class as keyof typeof pluginDescriptor.loadedModule
                ];
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
                        : await this.getPluginFromRegistry(extension.plugin);
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
            pluginDescriptor.extensionPoints?.forEach((extensionPoint) => {
                plugin!.connectExtensions(
                    extensionPoint.id,
                    extensionPoint.impl!
                );
            });

            pluginDescriptor.extensions?.forEach((extension) => {
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
        try {
            return new Promise((resolve, reject) => {
                // Emit the event and pass the resolve and reject functions as parameters
                EventService.getInstance().emit('@composaic.loadRemoteModule', {
                    url,
                    name,
                    bundleFile,
                    moduleName,
                    resolve,
                    reject,
                });
            });
        } catch (error) {
            console.error(`Error loading plugin: ${name}`, error);
        }
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
            const pluginDescriptor =
                await this.getPluginFromRegistry(pluginName);
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
        PluginRegistryService.getInstance().clear();
    }

    public getNumberOfPlugins() {
        return PluginRegistryService.getInstance().getNumberOfPlugins();
    }

    /**
     * Retrieves an array of plugin IDs registered in the PluginManager.
     *
     * @returns An array of plugin IDs.
     */
    public getPluginIds() {
        return PluginRegistryService.getInstance().getPluginIds();
    }
}
