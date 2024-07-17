// App.tsx or your routes file
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './menu/Navbar';
import HomePage from './menu/HomePage';
import Service1Page from './menu/Service1Page';
import Service2Page from './menu/Service2Page';
import AboutPage from './menu/AboutPage';

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/service1" element={<Service1Page />} />
                <Route path="/service2" element={<Service2Page />} />
                <Route path="/about" element={<AboutPage />} />
                {/* Define more routes as needed */}
            </Routes>
        </BrowserRouter>
    );
};
