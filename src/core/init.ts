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
import { LogCore } from '../plugins/types.js';

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
    console.log('[composaic] Booting Composaic...');
    await LoggingService.createInstance();
    LoggingService.getInstance().info({
        module: LogCore,
        message: 'Logging service initialised.',
    });
    const { addLocalPluginsFn, config, loadRemoteModuleFn } = options;
    RemoteModuleLoaderService.initialiseStaticInstance(loadRemoteModuleFn);
    const corePlugins = await loadPluginDefinitions();
    await PluginManager.getInstance().addPluginDefinitions(corePlugins);
    await LoggingService.createInstance(true);
    await addLocalPluginsFn?.();
    const configuration =
        ConfigurationService.getInstance(config).getConfiguration();
    LoggingService.getInstance().info({
        module: LogCore,
        message: `Configuration ${JSON.stringify(configuration)}`,
    });

    RemotePluginLoader.getInstance().loadManifests(configuration.remotes);

    // Create and initialize services
    await createServices();

    LoggingService.getInstance().info({
        module: LogCore,
        message: `Configuration: ${JSON.stringify(ConfigurationService.getInstance().getConfiguration())}`,
    });

    LoggingService.getInstance().info({
        module: LogCore,
        message: `Initialisation done, ${PluginManager.getInstance().getNumberOfPlugins()} plugins in total`,
    });
    LoggingService.getInstance().info({
        module: LogCore,
        message: `Plugins: ${PluginManager.getInstance()
            .getPluginIds()
            .map((plugin) => plugin)
            .join(', ')}`,
    });
};
