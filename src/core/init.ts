import { loadPluginDefinitions } from '../plugins/manifest-util';
import { createServices } from '../services/ServiceManager';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { ConfigurationService } from '../services/configuration';
import { RemotePluginManager } from '../plugins/RemotePluginManager';
import { LoggingService } from '../services/LoggingService';

export const initPlugins = async () => {
    const corePlugins = await loadPluginDefinitions();

    // // Add core plugins
    RemotePluginManager.getInstance().addPluginDefinitions(corePlugins);

    await RemotePluginLoader.getInstance().loadManifests(
        ConfigurationService.getInstance().getConfiguration().remotes
    );

    // Create and initialize services
    await createServices();

    LoggingService.getInstance().info(
        `Configuration: ${JSON.stringify(ConfigurationService.getInstance().getConfiguration())}`
    );

    LoggingService.getInstance().info(
        `Initialisation done, ${RemotePluginManager.getInstance().getNumberOfPlugins()} plugins in total`
    );
    LoggingService.getInstance().info(
        `Plugins: ${RemotePluginManager.getInstance()
            .getPluginIds()
            .map((plugin) => plugin)
            .join(', ')}`
    );

}