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
            console.log('Remote:', remote);
            const manifest = await fetch(remote + '/manifest.json');
            console.log('Manifest:', await manifest.json());
        });
    }
}
