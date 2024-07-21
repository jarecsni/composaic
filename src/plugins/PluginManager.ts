import { LoggingService } from '../services/LoggingService';
import { ClassConstructor, Plugin, PluginDescriptor } from './types';

/**
 * The `PluginManager` class is responsible for managing plugins in the application.
 * It provides methods to add, load, start, and get plugins.
 */
/**
 * The `PluginManager` class is responsible for managing plugins in the application.
 * It provides methods to add, load, and retrieve plugins, as well as start and clear the plugin registry.
 */
/**
 * The `PluginManager` class is responsible for managing plugins in the application.
 * It provides methods to add, load, and retrieve plugins, as well as start and clear the plugin registry.
 */
export class PluginManager {
    protected static instance: PluginManager;

    protected static registry: { [key: string]: PluginDescriptor } = {};

    protected constructor() {
        // Initialization code here
    }

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
    addPluginDefinitions(plugins: PluginDescriptor[]) {
        plugins.forEach((plugin) => {
            this.addPlugin(plugin);
        });
    }

    /**
     * Add a plugin definition to the registry
     * @param pluginDescriptor - a plugin definition
     */
    addPlugin(pluginDescriptor: PluginDescriptor) {
        pluginDescriptor.dependencies = [];
        pluginDescriptor.extensions?.forEach((extension) => {
            if (extension.plugin !== 'self') {
                // Add this plugin as a dependency to the plugin offering the extension point
                const targetPluginDescriptor =
                    PluginManager.registry[extension.plugin];
                targetPluginDescriptor.dependencies!.push(pluginDescriptor);
                // Also add the plugin offering the extension point as a dependency to this plugin
                pluginDescriptor.dependencies!.push(targetPluginDescriptor);
            }
        });
        PluginManager.registry[pluginDescriptor.plugin] = pluginDescriptor;
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
        const pluginDescriptor = PluginManager.registry[pluginName];
        if (!pluginDescriptor) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
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
        if (!pluginDescriptor.loadedModule) {
            if (!pluginDescriptor.remoteURL) {
                // load local module
                pluginDescriptor.loadedModule = await import(
                    `./impl/${pluginDescriptor.package}/${pluginDescriptor.module}.ts`
                );
            } else {
                // load remote module using module federation
                pluginDescriptor.loadedModule =
                    await this.loadRemotePluginModule(
                        pluginDescriptor.remoteURL,
                        pluginDescriptor.remoteName!,
                        pluginDescriptor.bundleFile!,
                        pluginDescriptor.remoteModuleName!
                    );
                if (pluginDescriptor.loadedModule === null) {
                    LoggingService.getInstance().error(
                        `Failed to load remote plugin ${pluginDescriptor.plugin}`
                    );
                    return null;
                }
            }
        }
        pluginDescriptor.loadedClass =
            pluginDescriptor.loadedModule![
                pluginDescriptor.class as keyof typeof pluginDescriptor.loadedModule
            ];
        if (pluginDescriptor.extensions) {
            for (const extension of pluginDescriptor.extensions) {
                const ExtensionImpl = pluginDescriptor.loadedModule![
                    extension.className as keyof typeof pluginDescriptor.loadedModule
                ] as ClassConstructor;
                extension.impl = new ExtensionImpl();
                const targetPlugin =
                    extension.plugin === 'self'
                        ? pluginDescriptor
                        : PluginManager.registry[extension.plugin];
                // look up the extension point in the targetPlugin matching the extension.id
                const extensionPoint = targetPlugin.extensionPoints!.find(
                    (ep) => ep.id === extension.id
                );
                // add the extension.impl into the targetPlugins's extensionPoint.impl array initialising it if necessary
                if (extensionPoint) {
                    if (!extensionPoint!.impl) {
                        extensionPoint!.impl = [];
                    }
                    extensionPoint!.impl!.push({
                        plugin: pluginDescriptor.plugin,
                        extensionImpl: extension.impl!,
                        meta: extension.meta,
                    });
                } else {
                    console.warn(
                        'Extension point not found',
                        targetPlugin.plugin,
                        extension.id
                    );
                }
            }
        }
        const PluginClass = pluginDescriptor.loadedClass! as ClassConstructor;
        const plugin = new PluginClass();

        pluginDescriptor.extensionPoints?.forEach((extensionPoint) => {
            plugin.connectExtensions(extensionPoint.id, extensionPoint.impl!);
        });

        pluginDescriptor.extensions?.forEach((extension) => {
            plugin.setExtensionImplementation(
                extension.plugin,
                extension.id,
                extension.impl!
            );
        });

        plugin.init(pluginDescriptor);
        pluginDescriptor.pluginInstance = plugin;

        return plugin;
    }

    async loadRemotePluginModule(
        url: string,
        name: string,
        bundleFile: string,
        moduleName: string
    ): Promise<object | undefined> {
        return undefined;
    }

    protected async startPlugin(plugin: Plugin, dependingPlugin?: Plugin) {
        if (plugin.pluginDescriptor.dependencies) {
            for (const dependency of plugin.pluginDescriptor.dependencies) {
                const pluginToLoad = (dependency as PluginDescriptor).plugin;
                if (pluginToLoad === dependingPlugin?.pluginDescriptor.plugin) {
                    continue;
                }
                await this.startPlugin(
                    (dependency as PluginDescriptor).pluginInstance!,
                    plugin
                );
            }
        }
        plugin.start();
    }

    /**
     * Get a plugin by name
     *
     * @param pluginName
     * @returns the plugin instance. If the plugin is not loaded, it will be loaded.
     */
    async getPlugin(pluginName: string): Promise<Plugin> {
        const pluginDescriptor = PluginManager.registry[pluginName];
        if (!pluginDescriptor) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
        if (!pluginDescriptor.pluginInstance) {
            await this.loadPlugin(pluginName);
        }
        this.startPlugin(pluginDescriptor.pluginInstance!);
        return pluginDescriptor.pluginInstance!;
    }

    clear() {
        PluginManager.registry = {};
    }

    public getNumberOfPlugins() {
        return Object.keys(PluginManager.registry).length;
    }

    /**
     * Retrieves an array of plugin IDs registered in the PluginManager.
     *
     * @returns An array of plugin IDs.
     */
    public getPluginIds() {
        return Object.keys(PluginManager.registry);
    }
}
