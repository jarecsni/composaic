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
import { PluginManager } from './plugins/PluginManager';
import { createServices } from './services/ServiceManager';
import { RemotePluginLoader } from './services/RemotePluginLoader';

// Add core plugins
PluginManager.getInstance().addPluginDefinitions(corePlugins);
// Create and initialize services
await createServices();

LoggingService.getInstance().info('App started, loading remote manifests...');

await RemotePluginLoader.getInstance().loadManifests(
    ConfigurationService.getInstance().getConfiguration().remotes
);
LoggingService.getInstance().info(`Initialisation done.`);

// ConfigurationService.getInstance()
//     .getConfiguration()
//     .remotes.forEach(async (remote) => {
//         console.log('Remote:', remote);
//         const manifest = await fetch(remote + '/manifest.json');
//         console.log('Manifest:', await manifest.json());

//         __federation_method_setRemote('TestPlugins', {
//             url: () =>
//                 Promise.resolve('http://localhost:9000/assets/TestPlugins.js'),
//             format: 'esm',
//             from: 'vite',
//         });
//         let comp = null;
//         try {
//             comp = await __federation_method_getRemote(
//                 'TestPlugins',
//                 './SimpleLogger'
//             );
//             console.log(comp);
//         } catch (error) {
//             console.error(error);
//             console.error('Error fetching remote', error);
//             comp = { default: () => <div>Failed to fetch remote</div> };
//         }
//     });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
