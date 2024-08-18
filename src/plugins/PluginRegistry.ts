export class PluginRegistry {
    private static instance: PluginRegistry;
    private registry: { [key: string]: any }; // Adjust the type as needed

    private constructor() {
        this.registry = {};
    }

    public static getInstance(): PluginRegistry {
        if (!PluginRegistry.instance) {
            PluginRegistry.instance = new PluginRegistry();
        }
        return PluginRegistry.instance;
    }

    public add(pluginName: string, plugin: any): void {
        // Adjust the type as needed
        this.registry[pluginName] = plugin;
    }

    public get(pluginName: string): any {
        // Adjust the type as needed
        return this.registry[pluginName];
    }

    public clear() {
        this.registry = {};
    }

    public getNumberOfPlugins(): number {
        return Object.keys(this.registry).length;
    }

    public getPluginIds(): string[] {
        return Object.keys(this.registry);
    }
}
