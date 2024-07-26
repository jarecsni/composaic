import React, { Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems, MenuItem } from './menu/menuModel'; // Import the MenuItemModel and menuItems
import { PluginManager } from '../plugins/PluginManager';
import { LoggingService } from '../services/LoggingService';
import { createServices } from '../services/ServiceManager';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { RemotePluginManager } from '../plugins/RemotePluginManager';
import { ConfigurationService } from '../services/configuration';
import corePlugins from '../plugins/core-plugins.json';
import { NavbarItem, NavbarPlugin } from '../plugins/impl/navbar';
import ErrorBoundary from './ErrorBoundary';

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

try {
    const simpleLoggerPlugin =
        await RemotePluginManager.getInstance().getPlugin(
            '@composaic-tests/simple-logger'
        );
    // @ts-expect-error
    simpleLoggerPlugin.log('Hello, world from SimpleLoggerPlugin!');
} catch (error) {
    LoggingService.getInstance().error(`Error occurred: ${error}`);
}

const transformNavBarItemsToMenuItems = (
    navBarItems: NavbarItem[],
    plugin?: string
): MenuItem[] => {
    return navBarItems.map((item: NavbarItem): MenuItem => {
        // Base transformation for items without children
        const componentPath = 'PluginComponentPage';
        const LazyComponent = React.lazy(
            () => import(`./menu/${componentPath}.tsx`)
        );
        // Create a wrapper component to pass props to the lazy-loaded component
        const ComponentWithProps = () => (
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent
                    component={item.component}
                    plugin={plugin || item.plugin}
                />
            </Suspense>
        );

        const menuItem: MenuItem = {
            label: item.label,
            path: item.path,
            component: item.component ? ComponentWithProps : undefined,
            children: item.children
                ? transformNavBarItemsToMenuItems(item.children, item.plugin)
                : undefined,
        };
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
                    element={<item.component />} //React.createElement(item.component)}
                />
            ) : null,
            item.children ? generateRoutes(item.children) : null,
        ])
        .filter(Boolean) as JSX.Element[];
};

export const App: React.FC = () => {
    const [routes, setRoutes] = useState<JSX.Element[]>([]);
    const menuItemsLoaded = useRef(false);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            PluginManager.getInstance()
                .getPlugin('@composaic/navbar')
                .then((plugin) => {
                    const navbarItems = (
                        plugin as NavbarPlugin
                    ).getNavbarItems();
                    const items = transformNavBarItemsToMenuItems(navbarItems);
                    for (const item of items) {
                        menuItems.push(item);
                    }
                    const generatedRoutes = generateRoutes(menuItems);
                    setRoutes(generatedRoutes);
                });
        }
    }, []);
    return (
        <BrowserRouter>
            <div>
                <Navbar />
                <ErrorBoundary fallback={<div>Something went wrong</div>}>
                    <Routes>{routes}</Routes>
                </ErrorBoundary>
            </div>
        </BrowserRouter>
    );
};
