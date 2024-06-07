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
            pluginDescriptor.dependencies!.push(extension.plugin);
        });
        PluginManager.registry[pluginDescriptor.plugin] = pluginDescriptor;
    }

    async loadPlugin(pluginName: string): Promise<PluginDescriptor> {
        const plugin = PluginManager.registry[pluginName];
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }
        plugin.dependencies?.forEach((dependency) => {
            this.loadPlugin(dependency as string);
        });
        let needInit = false;
        if (!plugin.loadedModule) {
            needInit = true;
            plugin.loadedModule = await import(plugin.module);
        }
        if (plugin.extensions && needInit) {
            for (const extension of plugin.extensions) {
                extension.impl =
                    plugin.loadedModule![
                        extension.className as keyof typeof plugin.loadedModule
                    ];
            }
        }
        return plugin;
    }

    /**
     * Get a plugin by name
     * @param pluginName
     * @returns the plugin instance. No attempt is made to protect this object from modification.
     */
    getPlugin(pluginName: string): PluginDescriptor {
        return PluginManager.registry[pluginName];
    }
}
