import { PluginDescriptor, PluginManifest } from '../plugins/types';

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
