import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems, MenuItem, MenuItemWithChildren } from './menu/menuModel'; // Import the MenuItemModel and menuItems
import { PluginManager } from '../plugins/PluginManager';
import { LoggingService } from '../services/LoggingService';
import { createServices } from '../services/ServiceManager';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { RemotePluginManager } from '../plugins/RemotePluginManager';
import { ConfigurationService } from '../services/configuration';
import corePlugins from '../plugins/core-plugins.json';
import { NavbarItem, NavbarPlugin } from '../plugins/impl/navbar';
import Example1Page from './menu/Example1Page';

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

const transformNavBarItemsToMenuItems = (
    navBarItems: NavbarItem[]
): MenuItem[] => {
    return navBarItems.map((item: NavbarItem): MenuItem => {
        // Base transformation for items without children
        const menuItem: MenuItem = {
            label: item.label,
            path: item.path,
            component: Example1Page,
        };

        // Recursively transform children if they exist
        if (item.children && item.children.length > 0) {
            (menuItem as unknown as MenuItemWithChildren).children =
                transformNavBarItemsToMenuItems(item.children);
        }

        return menuItem;
    });
};

// Update the generateRoutes function to use the MenuItemModel type
const generateRoutes = (items: MenuItem[]): JSX.Element[] => {
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
    const [routes, setRoutes] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const navBarPlugin = PluginManager.getInstance()
            .getPlugin('@composaic/navbar')
            .then((plugin) => {
                const navbarItems = (plugin as NavbarPlugin).getNavbarItems();
                const items = transformNavBarItemsToMenuItems(navbarItems);
                for (const item of items) {
                    menuItems.push(item);
                }
                const generatedRoutes = generateRoutes(menuItems);
                setRoutes(generatedRoutes);
            });
    }, []);
    return (
        <BrowserRouter>
            <div>
                <Navbar />
                <Routes>{routes}</Routes>
            </div>
        </BrowserRouter>
    );
};
