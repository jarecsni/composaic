import { PluginManager } from '../plugins/PluginManager.js';
import { PluginDescriptor, PluginManifest } from '../plugins/types.js';

/**
 * Converts a plugin manifest to an array of plugin descriptors.
 * @param manifest - The plugin manifest.
 * @param remote - The remote URL for the plugin.
 * @returns An array of plugin descriptors.
 */
export const convertManifestToPluginDescriptor = (
    manifest: PluginManifest,
    remote?: string
): PluginDescriptor[] => {
    return manifest.plugins.flatMap((plugin) => {
        return plugin.definitions.map((definition) => {
            const result: PluginDescriptor = {
                module: definition.module,
                package: definition.package,
                class: definition.class,
                plugin: definition.plugin,
                load: definition.load,
                version: definition.version,
                description: definition.description,
                extensionPoints: definition.extensionPoints?.map(
                    (extensionPoint) => {
                        return {
                            id: extensionPoint.id,
                            type: extensionPoint.type,
                        };
                    }
                ),
                extensions: definition.extensions?.map((extension) => {
                    return {
                        plugin: extension.plugin,
                        id: extension.id,
                        className: extension.className,
                        meta: extension.meta?.map((meta) => {
                            return { ...(meta as object) };
                        }),
                    };
                }),
            };
            if (remote) {
                result.remoteName = plugin.remote.name;
                result.remoteURL = remote;
                result.bundleFile = plugin.remote.bundleFile;
                result.remoteModuleName = './' + definition.module;
            }
            return result;
        });
    });
};

export type LoadModuleFunction = (
    module: string,
    pkg: string
) => Promise<object>;

export const processManifest = async (
    manifest: PluginManifest,
    loadModule: LoadModuleFunction
) => {
    const pluginDescriptors = convertManifestToPluginDescriptor(manifest);
    for (const pluginDescriptor of pluginDescriptors) {
        try {
            // FIXME
            // @ts-expect-error - we'll clear this up
            pluginDescriptor.loadedModule = await loadModule(
                pluginDescriptor.module,
                pluginDescriptor.package
            );
        } catch (error) {
            console.error('Error loading module:', error);
        }
    }
    PluginManager.getInstance().addPluginDefinitions(pluginDescriptors);
};

export const addLocalPlugins = async (loadModule: LoadModuleFunction) => {
    const response = await fetch('/manifest.json');
    const json = await response.json();
    await processManifest(json, loadModule);
};
