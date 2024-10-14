import { RemoteModuleLoaderService } from '../services/RemoteModuleLoaderService.js';
import { PluginManager } from '../plugins/PluginManager.js';
import { PluginDescriptor, PluginManifest } from '../plugins/types.js';
import { RemoteDefinition } from '../services/configuration.js';

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
    remote?: RemoteDefinition
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
                // FIXME - this needs to be properly cleared up - plugins should not define their own remote information at all!
                // For the time being we will just use the remote information from the configuration and ignore anything in the plugin manifest
                result.remoteName = remote.name;
                result.remoteURL = remote.host;
                result.bundleFile = remote.file;
                result.remoteModuleName = definition.module;
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
