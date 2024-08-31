import { loadPluginDefinitions } from '../plugins/manifest-util';
import { createServices } from '../services/ServiceManager';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { ConfigurationService } from '../services/configuration';
import { PluginManager } from '../plugins/PluginManager';
import { LoggingService } from '../services/LoggingService';
import { RemoteModuleLoaderService } from '../services/RemoteModuleLoaderService';

export const init = async (addLocalPluginsFn?: () => void) => {
    RemoteModuleLoaderService.getInstance();

    const corePlugins = await loadPluginDefinitions();

    // // Add core plugins
    PluginManager.getInstance().addPluginDefinitions(corePlugins);

    await addLocalPluginsFn?.();

    await RemotePluginLoader.getInstance().loadManifests(
        ConfigurationService.getInstance().getConfiguration().remotes
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
