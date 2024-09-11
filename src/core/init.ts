import { loadPluginDefinitions } from '../plugins/manifest-util.js';
import { createServices } from '../services/ServiceManager.js';
import { RemotePluginLoader } from '../services/RemotePluginLoader.js';
import {
    Configuration,
    ConfigurationService,
} from '../services/configuration.js';
import { PluginManager } from '../plugins/PluginManager.js';
import { LoggingService } from '../services/LoggingService.js';
import { RemoteModuleLoaderService } from '../services/RemoteModuleLoaderService.js';
import { PluginRegistryService } from '../services/PluginRegistryService.js';

export type RemoteModule = {
    url: string;
    name: string;
    bundleFile: string;
    moduleName: string;
};

export type RemoteModuleLoaderFn = (
    remoteModule: RemoteModule
) => Promise<object | undefined>;

interface InitOptions {
    addLocalPluginsFn?: () => void;
    config?: Configuration;
    loadRemoteModuleFn: RemoteModuleLoaderFn;
}

export const init = async (options: InitOptions) => {
    const { addLocalPluginsFn, config, loadRemoteModuleFn } = options;
    RemoteModuleLoaderService.initialiseStaticInstance(loadRemoteModuleFn);
    PluginRegistryService.getInstance();

    const corePlugins = await loadPluginDefinitions();

    // // Add core plugins
    PluginManager.getInstance().addPluginDefinitions(corePlugins);

    await addLocalPluginsFn?.();

    await RemotePluginLoader.getInstance().loadManifests(
        ConfigurationService.getInstance(config).getConfiguration().remotes
    );

    // Create and initialize services
    await createServices();

    LoggingService.getInstance().info(
        `Configuration: ${JSON.stringify(ConfigurationService.getInstance().getConfiguration())}`
    );

    LoggingService.getInstance().info(
        `Initialisation done, ${PluginManager.getInstance().getNumberOfPlugins()} plugins in total`
    );
    LoggingService.getInstance().info(
        `Plugins: ${PluginManager.getInstance()
            .getPluginIds()
            .map((plugin) => plugin)
            .join(', ')}`
    );
};
