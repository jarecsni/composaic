import { RemoteModuleLoaderService } from '../services/RemoteModuleLoaderService.js';
import { PluginManager } from '../plugins/PluginManager.js';
import { PluginDescriptor, PluginManifest } from '../plugins/types.js';

export const loadRemotePlugin = (pluginDescriptor: PluginDescriptor): Promise<object | undefined> => {
    return RemoteModuleLoaderService.getInstance().loadRemoteModule({
        url: pluginDescriptor.remoteURL!,
        name: pluginDescriptor.remoteName!,
        bundleFile: pluginDescriptor.bundleFile!,
        moduleName: pluginDescriptor.remoteModuleName!,
    });
};

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
                result.loader = loadRemotePlugin;
            }
            return result;
        });
    });
};

export type LoadModuleFunction = (pluginDescriptor: PluginDescriptor) => Promise<object | undefined>;

export const processManifest = async (
    manifest: PluginManifest,
    loadModule: LoadModuleFunction
) => {
    // TODO: think about refactoring the convertManifestToPluginDescriptor function
    // local plugin loader should be possible to pass in and not have to process
    // indidiually after calling the function
    const pluginDescriptors = convertManifestToPluginDescriptor(manifest);
    for (const pluginDescriptor of pluginDescriptors) {
        pluginDescriptor.loader = loadModule;
    }
    PluginManager.getInstance().addPluginDefinitions(pluginDescriptors);
};

export const addLocalPlugins = async (loadModule: LoadModuleFunction) => {
    const response = await fetch('/manifest.json');
    const json = await response.json();
    await processManifest(json, loadModule);
};
