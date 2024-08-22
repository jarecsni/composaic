import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems } from './menu/menuModel'; // Import the MenuItemModel and menuItems
import { RemotePluginManager } from '../plugins/RemotePluginManager';
import { NavbarPlugin } from '../plugins/impl/navbar';
import ErrorBoundary from './ErrorBoundary';
import { initPlugins } from './init';
import { generateRoutes, transformNavBarItemsToMenuItems } from './menu/menu-utils';

// Initalise Plugin Framework
await initPlugins();

// Example to access a plugin
// try {
//     const simpleLoggerPlugin =
//         await RemotePluginManager.getInstance().getPlugin(
//             '@composaic-tests/simple-logger'
//         );
//     // @ts-expect-error
//     simpleLoggerPlugin.log('Hello, world from SimpleLoggerPlugin!');
// } catch (error) {
//     LoggingService.getInstance().error(`Error occurred: ${error}`);
// }

export const App: React.FC = () => {
    const [routes, setRoutes] = useState<JSX.Element[]>([]);
    const menuItemsLoaded = useRef(false);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            RemotePluginManager.getInstance()
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
