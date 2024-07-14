import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';
import { App } from './core/App';
import { ConfigurationService } from './services/configuration';
import corePlugins from './plugins/core-plugins.json';
import './index.css';
import { LoggingService } from './services/LoggingService';
import { createServices } from './services/ServiceManager';
import { RemotePluginLoader } from './services/RemotePluginLoader';
import { RemotePluginManager } from './plugins/RemotePluginManager';

// // Add core plugins
RemotePluginManager.getInstance().addPluginDefinitions(corePlugins);
// // Create and initialize services
await createServices();

LoggingService.getInstance().info('App started, loading remote manifests...');
LoggingService.getInstance().info(
    `Configuration: ${JSON.stringify(ConfigurationService.getInstance().getConfiguration())}`
);

await RemotePluginLoader.getInstance().loadManifests(
    ConfigurationService.getInstance().getConfiguration().remotes
);
LoggingService.getInstance().info(`Initialisation done.`);

const simpleLoggerPlugin = await RemotePluginManager.getInstance().getPlugin(
    '@composaic-tests/simple-logger'
);
// @ts-expect-error
simpleLoggerPlugin.log('Hello, world from SimpleLoggerPlugin!');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
