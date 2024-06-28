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
            }
        });
        PluginManager.registry[pluginDescriptor.plugin] = pluginDescriptor;
    }

    async loadPlugin(pluginName: string): Promise<Plugin> {
        const pluginDescriptor = PluginManager.registry[pluginName];
        if (!pluginDescriptor) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
        if (pluginDescriptor.dependencies) {
            for (const dependency of pluginDescriptor.dependencies) {
                await this.loadPlugin((dependency as PluginDescriptor).plugin);
            }
        }
        let needInit = false;
        if (!pluginDescriptor.loadedModule) {
            needInit = true;
            console.log(`Loading module ${pluginDescriptor.module}`);
            pluginDescriptor.loadedModule = await import(
                `./impl/${pluginDescriptor.package}/${pluginDescriptor.module}.ts`
            );
            pluginDescriptor.loadedClass =
                pluginDescriptor.loadedModule![
                    pluginDescriptor.class as keyof typeof pluginDescriptor.loadedModule
                ];
        }
        if (pluginDescriptor.extensions && needInit) {
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

        plugin.init(pluginDescriptor);
        return plugin;
    }

    /**
     * Get a plugin by name
     *
     * @param pluginName
     * @returns the plugin instance. If the plugin is not loaded, it will be loaded.
     */
    getPlugin(pluginName: string): PluginDescriptor {
        return PluginManager.registry[pluginName];
    }
}
