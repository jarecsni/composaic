import loggerPluginDef from './impl/logger/logger-plugin.json';
import navbarPluginDef from './impl/navbar/navbar-plugin.json';
import signalsPluginDef from './impl/signals/signals-plugin.json';
import viewsPluginDef from './impl/views/views-plugin.json';
import { loadCorePlugin } from './PluginManager.js';
import { PluginDescriptor } from './types.js';

export async function loadPluginDefinitions(): Promise<PluginDescriptor[]> {
    const plugins: PluginDescriptor[] = [
        { ...loggerPluginDef, loader: loadCorePlugin } as PluginDescriptor,
        { ...navbarPluginDef, loader: loadCorePlugin } as PluginDescriptor,
        { ...signalsPluginDef, loader: loadCorePlugin } as PluginDescriptor,
        { ...viewsPluginDef, loader: loadCorePlugin } as PluginDescriptor,
    ];
    return plugins;
}
