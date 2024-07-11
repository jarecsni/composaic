import { convertManifestToPluginDescriptor } from '../dev/local-plugin-utils';
import { PluginDescriptor } from '../plugins/types';
import { LoggingService } from './LoggingService';

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

    loadManifests(remotes: string[]): void {
        remotes.forEach(async (remote) => {
            try {
                const manifestRaw = await fetch(remote + '/manifest.json');
                const manifest = await manifestRaw.json();
                LoggingService.getInstance().info(
                    `Loaded manifest from ${remote}: ${JSON.stringify(manifest)}`
                );
                const pluginDescriptor: PluginDescriptor[] =
                    convertManifestToPluginDescriptor(manifest);
                LoggingService.getInstance().info(
                    `Converted manifest to plugin descriptor: ${JSON.stringify(pluginDescriptor)}`
                );
            } catch (error) {
                console.error(
                    'Error loading manifest:',
                    (error as any).message
                );
            }
        });
    }
}
