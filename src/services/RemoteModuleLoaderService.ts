import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';
import { EventService } from './EventService';

/**
 * Represents a remote module that can be loaded dynamically.
 */
type RemoteModule = {
    url: string;
    name: string;
    bundleFile: string;
    moduleName: string;
    resolve: (value: object | undefined) => void;
    reject: (reason?: any) => void;
};

/**
 * Service for loading remote modules dynamically.
 * 
 * This approach is necessary to avoid the remote module referencing the __federation__ virtual module as that leads to a loading error.
 * The PluginManager uses this service to load remote modules - and since we are using eventing, the bundler won't see the reference to __federation__.
 */
export class RemoteModuleLoaderService {
    private static instance: RemoteModuleLoaderService;

    private constructor() {
        // Private constructor to prevent instantiation
        EventService.getInstance().on<RemoteModule>(
            '@composaic.loadRemoteModule',
            this.loadRemoteModule
        );
    }

    /**
     * Gets the singleton instance of RemoteModuleLoaderService.
     * @returns The singleton instance of RemoteModuleLoaderService.
     */
    public static getInstance(): RemoteModuleLoaderService {
        if (!RemoteModuleLoaderService.instance) {
            RemoteModuleLoaderService.instance =
                new RemoteModuleLoaderService();
        }
        return RemoteModuleLoaderService.instance;
    }

    /**
     * Loads a remote module.
     * @param remoteModule - The remote module to load.
     */
    private async loadRemoteModule(remoteModule: RemoteModule) {
        const { url, name, bundleFile, moduleName, resolve, reject } =
            remoteModule;
        __federation_method_setRemote(name, {
            url: () =>
                Promise.resolve(`${remoteModule.url}/assets/${bundleFile}`),
            format: 'esm',
            from: 'vite',
        });
        try {
            const module = await __federation_method_getRemote(
                name,
                moduleName
            );
            resolve(module);
        } catch (error) {
            console.error(
                `[composaic] Error fetching remote plugin module ${moduleName}, url=${url}, name=${name} : ${error}`
            );
            reject(error);
        }
    }
}
