// App.tsx or your routes file
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './menu/Navbar';
import { menuItems } from './menu/menuModel'; // Import the menu model

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {menuItems.map((item, index) => (
                    <Route
                        key={index}
                        path={item.path}
                        element={React.createElement(item.component)}
                    />
                ))}
            </Routes>
        </BrowserRouter>
    );
};
