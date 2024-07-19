import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems, MenuItemModel } from './menu/menuModel'; // Import the MenuItemModel and menuItems

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
