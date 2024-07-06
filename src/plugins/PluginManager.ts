import { ClassConstructor, Plugin, PluginDescriptor } from './types';

export class PluginManager {
    private static instance: PluginManager;

    private static registry: { [key: string]: PluginDescriptor } = {};

    private constructor() {
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

    private async loadPlugin(pluginName: string, dependingPlugin?: string): Promise<Plugin> {
        console.log('loadPlugin', 'request to load plugin', pluginName, dependingPlugin);
        const pluginDescriptor = PluginManager.registry[pluginName];
        if (!pluginDescriptor) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
        if (pluginDescriptor.pluginInstance) {
            console.log('loadPlugin', 'plugin already loaded', pluginName, dependingPlugin);
            return pluginDescriptor.pluginInstance;
        }
        if (pluginDescriptor.dependencies) {
            for (const dependency of pluginDescriptor.dependencies) {
                const pluginToLoad = (dependency as PluginDescriptor).plugin;
                if (pluginToLoad === dependingPlugin) {
                    console.log('load: ignoring self dependency', pluginToLoad);
                    continue;
                }
                const dependencyPlugin = await this.loadPlugin(
                    (dependency as PluginDescriptor).plugin,
                    pluginDescriptor.plugin
                );
            }
        }
        if (!pluginDescriptor.loadedModule) {
            pluginDescriptor.loadedModule = await import(
                `./impl/${pluginDescriptor.package}/${pluginDescriptor.module}.ts`
            );
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

    private async startPlugin(plugin: Plugin, dependingPlugin?: Plugin) {
        if (plugin.pluginDescriptor.dependencies) {
            for (const dependency of plugin.pluginDescriptor.dependencies) {
                const pluginToLoad = (dependency as PluginDescriptor).plugin;
                if (pluginToLoad === dependingPlugin?.pluginDescriptor.plugin) {
                    console.log(
                        'start: ignoring self dependency',
                        pluginToLoad
                    );
                    continue;
                }
                const dependencyPlugin = await this.startPlugin(
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
}
