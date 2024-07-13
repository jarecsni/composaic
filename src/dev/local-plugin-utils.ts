import { PluginDescriptor, PluginManifest } from '../plugins/types';

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
