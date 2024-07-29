import React, { Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '../core/menu/Navbar';
import { menuItems, MenuItem } from '../core/menu/menuModel'; // Import the MenuItemModel and menuItems
import { PluginManager } from '../plugins/PluginManager';
import { NavbarItem, NavbarPlugin } from '../plugins/impl/navbar';
import ErrorBoundary from '../core/ErrorBoundary';
import PluginComponentPage from '../core/menu/PluginComponentPage';
import { LoggingService } from '../services/LoggingService';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { ConfigurationService } from '../services/configuration';
import { createServices } from '../services/ServiceManager';
import corePlugins from '../plugins/core-plugins.json';

const initCore = async () => {
    PluginManager.getInstance().clear();
    // // Add core plugins
    PluginManager.getInstance().addPluginDefinitions(corePlugins);
    // // Create and initialize services
    await createServices();

    LoggingService.getInstance().info(
        'App started, loading remote manifests...'
    );
    LoggingService.getInstance().info(
        `Configuration: ${JSON.stringify(ConfigurationService.getInstance().getConfiguration())}`
    );

    await RemotePluginLoader.getInstance().loadManifests(
        ConfigurationService.getInstance().getConfiguration().remotes
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

const transformNavBarItemsToMenuItems = (
    navBarItems: NavbarItem[],
    plugin?: string
): MenuItem[] => {
    return navBarItems.map((item: NavbarItem): MenuItem => {
        const ComponentWithProps = () => (
            <Suspense fallback={<div>Loading...</div>}>
                <PluginComponentPage
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
            initCore().then(() => {
                PluginManager.getInstance()
                    .getPlugin('@composaic/navbar')
                    .then((plugin) => {
                        const navbarItems = (
                            plugin as NavbarPlugin
                        ).getNavbarItems();
                        const items =
                            transformNavBarItemsToMenuItems(navbarItems);
                        for (const item of items) {
                            menuItems.push(item);
                        }
                        const generatedRoutes = generateRoutes(menuItems);
                        setRoutes(generatedRoutes);
                    });
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
