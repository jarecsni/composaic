import React from 'react';
import HomePage from './pages/HomePage.js';
import Service1Page from './pages/Service1Page.js';
import Service2Page from './pages/Service2Page.js';
import AboutPage from './pages/AboutPage.js';

// Define a type where component is required and children is omitted
export interface MenuItem {
    id: string;
    mountAt?: string;
    label: string;
    path?: string;
    component?: React.ComponentType;
    children?: MenuItem[];
}

// Sample menu model
export const menuItems: MenuItem[] = [
    { id: 'root.Home', label: 'Home', path: '/', component: HomePage },
    {
        id: 'root.Services',
        label: 'Services',
        children: [
            {
                id: 'services.ServiceOne',
                label: 'Service 1',
                path: '/service1',
                component: Service1Page,
            },
            {
                id: 'services.ServiceTwo',
                label: 'Service 2',
                path: '/service2',
                component: Service2Page,
            },
        ],
    },
    { id: 'root.About', label: 'About', path: '/about', component: AboutPage },
];
