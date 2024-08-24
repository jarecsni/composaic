import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import ErrorBoundary from './ErrorBoundary';
import { initPlugins } from './init';
import { getRoutes } from './menu/menu-utils';

// Initalise Plugin Framework
await initPlugins();

export const App: React.FC = () => {
    const [routes, setRoutes] = useState<JSX.Element[]>([]);
    const menuItemsLoaded = useRef(false);

    useEffect(() => {
        if (!menuItemsLoaded.current) {
            menuItemsLoaded.current = true;
            getRoutes().then((generatedRoutes) => {
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
