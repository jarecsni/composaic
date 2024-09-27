import { RemoteModule, RemoteModuleLoaderFn } from '../core/init';

/**
 * Service for loading remote modules dynamically.
 *
 * This approach is necessary to avoid the remote module referencing the __federation__ virtual module as that leads to a loading error.
 * The PluginManager uses this service to load remote modules - and since we are using eventing, the bundler won't see the reference to __federation__.
 */
export class RemoteModuleLoaderService {
    private static instance: RemoteModuleLoaderService;
    private loadRemoteModuleFn: RemoteModuleLoaderFn;

    private constructor(loadRemoteModuleFn: RemoteModuleLoaderFn) {
        this.loadRemoteModuleFn = loadRemoteModuleFn;
    }

    /**
     * Gets the singleton instance of RemoteModuleLoaderService.
     * @returns The singleton instance of RemoteModuleLoaderService.
     */
    public static initialiseStaticInstance(
        loadRemoteModuleFn: RemoteModuleLoaderFn
    ): RemoteModuleLoaderService {
        if (!RemoteModuleLoaderService.instance) {
            RemoteModuleLoaderService.instance = new RemoteModuleLoaderService(
                loadRemoteModuleFn
            );
        }
        return RemoteModuleLoaderService.instance;
    }

    public static getInstance(): RemoteModuleLoaderService {
        return RemoteModuleLoaderService.instance;
    }

    /**
     * Loads a remote module.
     * @param remoteModule - The remote module to load.
     */
    public async loadRemoteModule(
        remoteModule: RemoteModule
    ): Promise<object | undefined> {
        return this.loadRemoteModuleFn(remoteModule);
    }
}
