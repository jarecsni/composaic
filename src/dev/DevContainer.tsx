import React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.js';
import { init } from '../core/init.js';
import { Navbar } from '../core/menu/Navbar.js';
import { getRoutes } from '../core/menu/menu-utils.js';
import { addLocalPlugins } from './plugin-utils.js';
import { Configuration } from '../services/configuration.js';

interface DevContainerProps {
    loadModuleFn(moduleName: string, pkg: string): Promise<object>;
    config: Configuration;
}

export const DevContainer: FC<DevContainerProps> = ({
    loadModuleFn,
    config,
}) => {
    const [routes, setRoutes] = useState<JSX.Element[]>([]);
    const menuItemsLoaded = useRef(false);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            init({
                addLocalPluginsFn: async () => {
                    await addLocalPlugins(loadModuleFn);
                },
                // FIXME: remote module loading in dev container not supported as yet
                loadRemoteModuleFn: async () => Promise.resolve({}),
                config,
            }).then(() => {
                getRoutes().then((generatedRoutes) => {
                    setRoutes(generatedRoutes);
                });
            }).catch((err) => {
                console.error(err);
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
