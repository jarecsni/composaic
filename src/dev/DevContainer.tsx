import React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { init } from '../core/init';
import { Navbar } from '../core/menu/Navbar';
import { getRoutes } from '../core/menu/menu-utils';
import { addLocalPlugins } from './plugin-utils';

interface DevContainerProps {
    loadModuleFn(moduleName: string, pkg: string): Promise<object>;
}

export const DevContainer: FC<DevContainerProps> = ({ loadModuleFn }) => {
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
            }).then(() => {
                getRoutes().then((generatedRoutes) => {
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
