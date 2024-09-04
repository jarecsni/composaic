import loggerPluginDef from './impl/logger/logger-plugin.json' with { type: 'json' };
import navbarPluginDef from './impl/navbar/navbar-plugin.json' with { type: 'json' };
import signalsPluginDef from './impl/signals/signals-plugin.json' with { type: 'json' };
import viewsPluginDef from './impl/views/views-plugin.json' with { type: 'json' };

export async function loadPluginDefinitions() {
    const plugins = [
        loggerPluginDef,
        navbarPluginDef,
        signalsPluginDef,
        viewsPluginDef,
    ];
    return plugins;
}
