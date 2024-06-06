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
        console.log(`Adding plugin ${pluginDescriptor.plugin}`);
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
        console.log(`Loading plugin ${pluginName}`);
        plugin.dependencies?.forEach((dependency) => {
            console.log(`Loading dependency ${dependency}`);
            this.loadPlugin(dependency as string);
        });
        console.log(`Initializing plugin ${pluginName}`);
        if (plugin.extensions) {
            for (const extension of plugin.extensions) {
                console.log(`Initializing extension ${extension.id}`);
                // FIXME - this is a hack. We need to use the module field to load the correct module.
                const impl = await import('./' + extension.className);
                console.log('impl', impl);
                extension.impl = impl[extension.className];
                console.log('extension.impl', extension.impl);
            }
        }
        console.log(`Plugin ${pluginName} loaded`, plugin);
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
