import React, { Suspense, FC, useEffect, useRef, useState } from 'react';
import { PluginManager } from '../plugins/PluginManager';
import { PluginManifest } from '../plugins/types';
import { convertManifestToPluginDescriptor } from './plugin-utils';
import { LoggingService } from '../services/LoggingService';
import { RemotePluginLoader } from '../services/RemotePluginLoader';
import { ConfigurationService } from '../services/configuration';
import { createServices } from '../services/ServiceManager';
import corePlugins from '../plugins/core-plugins.json';
import PluginComponentPage from '../core/menu/PluginComponentPage';
import { menuItems, MenuItem } from '../core/menu/menuModel'; // Import the MenuItemModel and menuItems
import { NavbarItem, NavbarPlugin } from '../plugins/impl/navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '../core/menu/Navbar';
import ErrorBoundary from '../core/ErrorBoundary';

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

interface DevContainerProps {
    loadModule(moduleName: string, pkg: string): Promise<object>;
}

const processManifest = async (
    manifest: PluginManifest,
    loadModule: DevContainerProps['loadModule']
) => {
    const pluginDescriptors = convertManifestToPluginDescriptor(manifest);
    for (const pluginDescriptor of pluginDescriptors) {
        // FIXME
        // @ts-expect-error - we'll clear this up
        pluginDescriptor.loadedModule = await loadModule(
            pluginDescriptor.module,
            pluginDescriptor.package
        );
    }
    PluginManager.getInstance().addPluginDefinitions(pluginDescriptors);
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
            id: item.id,
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

export const DevContainer: FC<DevContainerProps> = ({ loadModule }) => {
    const isInitialized = useRef(false);
    const menuItemsLoaded = useRef(false);
    const [routes, setRoutes] = useState<JSX.Element[]>([]);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            initCore().then(() => {
                fetch('/manifest.json').then((response) => {
                    response.json().then(async (json) => {
                        await processManifest(json, loadModule);
                        const plugin =
                            await PluginManager.getInstance().getPlugin(
                                '@composaic/navbar'
                            );
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
                        const simpleLoggerPlugin =
                            await PluginManager.getInstance().getPlugin(
                                '@composaic-tests/simple-logger'
                            );
                        // @ts-expect-error
                        simpleLoggerPlugin.log(
                            'Hello, world from SimpleLoggerPlugin!'
                        );
                    });
                });
                isInitialized.current = true;
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
