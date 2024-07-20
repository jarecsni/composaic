import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems, MenuItemModel } from './menu/menuModel'; // Import the MenuItemModel and menuItems
import { PluginManager } from '../plugins/PluginManager';
import { LoggingService } from '../services/LoggingService';
import { createServices } from '../services/ServiceManager';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { RemotePluginManager } from '../plugins/RemotePluginManager';
import { ConfigurationService } from '../services/configuration';
import corePlugins from '../plugins/core-plugins.json';

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
LoggingService.getInstance().info(
    `Initialisation done, ${RemotePluginManager.getInstance().getNumberOfPlugins()} plugins in total`
);
LoggingService.getInstance().info(
    `Plugins: ${RemotePluginManager.getInstance()
        .getPluginIds()
        .map((plugin) => plugin)
        .join(', ')}`
);

// const simpleLoggerPlugin = await RemotePluginManager.getInstance().getPlugin(
//     '@composaic-tests/simple-logger'
// );
// // @ts-expect-error
// simpleLoggerPlugin.log('Hello, world from SimpleLoggerPlugin!');

const navBarPlugin =
    await PluginManager.getInstance().getPlugin('@composaic/navbar');

// Update the generateRoutes function to use the MenuItemModel type
const generateRoutes = (items: MenuItemModel[]): JSX.Element[] => {
    return items
        .flatMap((item, index) => [
            item.component ? (
                <Route
                    key={index}
                    path={item.path}
                    element={React.createElement(item.component)}
                />
            ) : null,
            item.children ? generateRoutes(item.children) : null,
        ])
        .filter(Boolean) as JSX.Element[];
};

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div>
                <Navbar />
                <Routes>{generateRoutes(menuItems)}</Routes>
            </div>
        </BrowserRouter>
    );
};
