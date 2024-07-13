import { PluginDescriptor, PluginManifest } from '../plugins/types';

// TODO this is vite specific, we should move this to a vite specific file
import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';

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
                    };
                }),
            };
            if (remote) {
                result.remoteName = plugin.remote.name;
                result.remoteURL = remote;
            }
            return result;
        });
    });
};

/**
 * Loads a remote plugin module.
 * @param url - The URL of the remote plugin.
 * @param name - The name of the remote plugin.
 * @param moduleName - The name of the module to load.
 * @returns A promise that resolves to the loaded module object, or null if there was an error.
 */
export const loadRemotePluginModule = async (
    url: string,
    name: string,
    moduleName: string
): Promise<object | null> => {
    __federation_method_setRemote(name, {
        url: () => Promise.resolve(url),
        format: 'esm',
        from: 'vite',
    });
    let loadedModule: object | null = null;
    try {
        loadedModule = await __federation_method_getRemote(name, moduleName);
    } catch (error) {
        console.error(error);
        console.error('Error fetching remote', error);
    }
    return loadedModule;
};
