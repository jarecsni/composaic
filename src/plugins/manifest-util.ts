import loggerPluginDef from './impl/logger/logger-plugin.json';
import navbarPluginDef from './impl/navbar/navbar-plugin.json';
import signalsPluginDef from './impl/signals/signals-plugin.json';
import viewsPluginDef from './impl/views/views-plugin.json';

export async function loadPluginDefinitions() {
    const plugins = [
        loggerPluginDef,
        navbarPluginDef,
        signalsPluginDef,
        viewsPluginDef,
    ];
    return plugins;
}
