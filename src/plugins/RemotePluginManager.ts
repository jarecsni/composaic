import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';
import { PluginManager } from './PluginManager';

export class RemotePluginManager extends PluginManager {
    protected static instance: RemotePluginManager;

    private constructor() {
        super();
    }

    public static getInstance(): RemotePluginManager {
        if (!RemotePluginManager.instance) {
            RemotePluginManager.instance = new RemotePluginManager();
        }
        return RemotePluginManager.instance;
    }

    async loadRemotePluginModule(
        url: string,
        name: string,
        bundleFile: string,
        moduleName: string
    ): Promise<object | undefined> {
        __federation_method_setRemote(name, {
            url: () => Promise.resolve(`${url}/assets/${bundleFile}`),
            format: 'esm',
            from: 'vite',
        });
        try {
            return await __federation_method_getRemote(name, moduleName);
        } catch (error) {
            console.error(
                `[composaic] Error fetching remote plugin module ${moduleName}, url=${url}, name=${name} : ${error}`
            );
            return undefined;
        }
    }
}
