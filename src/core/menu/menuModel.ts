import React from 'react';
import HomePage from './HomePage';
import Service1Page from './Service1Page';
import Service2Page from './Service2Page';
import AboutPage from './AboutPage';

export interface MenuItemModel {
    label: string;
    path: string;
    component: React.ComponentType;
}

export const menuItems: MenuItemModel[] = [
    { label: 'Home', path: '/', component: HomePage },
    { label: 'Service 1', path: '/service1', component: Service1Page },
    { label: 'Service 2', path: '/service2', component: Service2Page },
    { label: 'About', path: '/about', component: AboutPage },
    // Add more items as needed
];
