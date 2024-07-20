import React from 'react';
import HomePage from './HomePage';
import Service1Page from './Service1Page';
import Service2Page from './Service2Page';
import AboutPage from './AboutPage';

// Define a type where component is required and children is omitted
interface MenuItemWithComponent {
    label: string;
    path: string;
    component: React.ComponentType;
    children?: never; // Explicitly stating that children should not be used here
}

// Define a type where children is required and component is omitted
interface MenuItemWithChildren {
    label: string;
    path: string;
    component?: never; // Explicitly stating that component should not be used here
    children: MenuItemModel[]; // Recursive type reference
}

// Use a union type to combine both cases
export type MenuItemModel = MenuItemWithComponent | MenuItemWithChildren;

// Sample menu model
export const menuItems: MenuItemModel[] = [
    { label: 'Home', path: '/', component: HomePage },
    {
        label: 'Services',
        path: '/services',
        children: [
            { label: 'Service 1', path: '/service1', component: Service1Page },
            { label: 'Service 2', path: '/service2', component: Service2Page },
        ],
    },
    { label: 'About', path: '/about', component: AboutPage },
];