import { convertManifestToPluginDescriptor } from '../dev/plugin-utils';
import { PluginManager } from '../plugins/PluginManager';
import { PluginDescriptor } from '../plugins/types';

export class RemotePluginLoader {
    private static instance: RemotePluginLoader;

    private constructor() {
        // Private constructor to prevent instantiation from outside the class
    }

    public static getInstance(): RemotePluginLoader {
        if (!RemotePluginLoader.instance) {
            RemotePluginLoader.instance = new RemotePluginLoader();
        }
        return RemotePluginLoader.instance;
    }

    async loadManifests(remotes: string[]): Promise<void> {
        try {
            await Promise.all(
                remotes.map(async (remote) => {
                    const manifestRaw = await fetch(remote + '/manifest.json');
                    const manifest = await manifestRaw.json();
                    console.log(
                        `[composaic] Loaded manifest from ${remote}: ${JSON.stringify(manifest)}`
                    );
                    const pluginDescriptor: PluginDescriptor[] =
                        convertManifestToPluginDescriptor(manifest, remote);
                    console.log(
                        `[composaic] Converted manifest to plugin descriptor: ${JSON.stringify(pluginDescriptor)}`
                    );
                    await PluginManager.getInstance().addPluginDefinitions(
                        pluginDescriptor
                    );
                })
            );
        } catch (error) {
            console.error(
                '[composaic] Error loading manifest:',
                (error as any).message
            );
        } finally {
            console.log(
                `[composaic] Done loading manifests from ${remotes.length} remotes.`
            );
        }
    }
}
