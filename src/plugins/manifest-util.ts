import corePlugins from './core-plugins.json' assert { type: 'json' };

export async function loadPluginDefinitions() {
    const plugins = [];

    for (const pluginPath of corePlugins) {
        try {
            // Dynamically import each plugin JSON file based on its path in core-plugins.json
            const pathElements = pluginPath.split('/');
            const plugin = await import(
                `./impl/${pathElements[0]}/${pathElements[1]}.json`
            );
            // Assuming each plugin JSON file contains an "id" field at the top level
            plugins.push(plugin.default);
        } catch (error) {
            console.error(`Failed to load plugin at ${pluginPath}:`, error);
        }
    }

    return plugins;
}
