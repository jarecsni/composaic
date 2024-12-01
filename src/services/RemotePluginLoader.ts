import { convertManifestToPluginDescriptor } from '../dev/plugin-utils.js';
import { PluginManager } from '../plugins/PluginManager.js';
import { PluginDescriptor } from '../plugins/types.js';
import { RemoteDefinition } from './configuration.js';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    /**
     *
     * @param remotes
     */
    async loadManifests(remotes: RemoteDefinition[]): Promise<void> {
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        try {
            for (const remote of remotes) {
                console.log(
                    `[composaic] Loading manifest from remote: ${remote.host}`
                );
                const manifestRaw = await fetch(remote.host + '/manifest.json');
                if (!manifestRaw.ok) {
                    throw new Error(
                        `Failed to fetch manifest from ${remote.host}`
                    );
                }
                const manifest = await manifestRaw.json();
                console.log(
                    `[composaic] Loaded manifest from ${remote.host}: ${JSON.stringify(manifest)}`
                );
                const pluginDescriptor: PluginDescriptor[] =
                    convertManifestToPluginDescriptor(manifest, remote);
                console.log(
                    `[composaic] Converted manifest to plugin descriptor: ${JSON.stringify(pluginDescriptor)}`
                );
                await PluginManager.getInstance().addPluginDefinitions(
                    pluginDescriptor
                );
                console.log(
                    `[composaic] Added plugin definitions for remote: ${remote.host}`
                );
            }
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
