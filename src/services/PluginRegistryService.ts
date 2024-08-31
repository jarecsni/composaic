import { PluginDescriptor } from '../plugins/types';
import { EventService } from './EventService';

type PluginDef = {
    pluginDescriptor: PluginDescriptor;
    resolve: (value: any) => void;
};

type PluginReq = {
    pluginName: string;
    resolve: (value: any) => void;
};

export class PluginRegistryService {
    private static instance: PluginRegistryService;
    private registry: { [key: string]: any }; // Adjust the type as needed

    private constructor() {
        this.registry = {};
        EventService.getInstance().on<PluginDef>(
            '@composaic.addPlugin',
            this.add.bind(this)
        );

        EventService.getInstance().on<PluginReq>(
            '@composaic.getPlugin',
            this.get.bind(this)
        );
    }

    public static getInstance(): PluginRegistryService {
        if (!PluginRegistryService.instance) {
            PluginRegistryService.instance = new PluginRegistryService();
        }
        return PluginRegistryService.instance;
    }

    public add(pluginDef: PluginDef): void {
        const { pluginDescriptor, resolve } = pluginDef;
        this.registry[pluginDescriptor.plugin] = pluginDescriptor;
        resolve(pluginDescriptor);
    }

    public get(plugin: PluginReq) {
        const { pluginName, resolve } = plugin;
        resolve(this.registry[pluginName]);
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
