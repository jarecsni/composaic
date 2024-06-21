import { PluginDescriptor } from './types';

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

    // Add your methods here
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

    async loadPlugin(pluginName: string): Promise<PluginDescriptor> {
        const plugin = PluginManager.registry[pluginName];
        if (!plugin) {
            throw new Error(`Plugin with ID ${pluginName} not found`);
        }
        if (plugin.dependencies) {
            for (const dependency of plugin.dependencies) {
                await this.loadPlugin((dependency as PluginDescriptor).plugin);
            }
        }
        let needInit = false;
        if (!plugin.loadedModule) {
            needInit = true;
            console.log(`Loading module ${plugin.module}`);
            plugin.loadedModule = await import(
                `./impl/${plugin.package}/${plugin.module}.ts`
            );
            plugin.loadedClass =
                plugin.loadedModule![
                    plugin.class as keyof typeof plugin.loadedModule
                ];
        }
        if (plugin.extensions && needInit) {
            for (const extension of plugin.extensions) {
                extension.impl =
                    plugin.loadedModule![
                        extension.className as keyof typeof plugin.loadedModule
                    ];
                const targetPlugin =
                    extension.plugin === 'self'
                        ? plugin
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
                        plugin: plugin.plugin,
                        extensionImpl: extension.impl,
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
        // load class
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
