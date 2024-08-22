import React, { Suspense } from 'react';
import { NavbarItem } from '../../plugins/impl/navbar';
import { MenuItem } from './menuModel'; // Import the MenuItemModel and menuItems
import { Route } from 'react-router-dom';

export const transformNavBarItemsToMenuItems = (
    navBarItems: NavbarItem[],
    plugin?: string
): MenuItem[] => {
    return navBarItems.map((item: NavbarItem): MenuItem => {
        // Base transformation for items without children
        const LazyComponent = React.lazy(
            () => import(`./PluginComponentPage`)
        );
        // Create a wrapper component to pass props to the lazy-loaded component
        const ComponentWithProps = () => (
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent
                    component={item.component}
                    plugin={plugin || item.plugin}
                />
            </Suspense>
        );

        const menuItem: MenuItem = {
            id: item.id,
            label: item.label,
            path: item.path,
            component: item.component ? ComponentWithProps : undefined,
            children: item.children
                ? transformNavBarItemsToMenuItems(item.children, item.plugin)
                : undefined,
        };
        return menuItem;
    });
};

// Update the generateRoutes function to use the MenuItemModel type
export const generateRoutes = (items: MenuItem[]): JSX.Element[] => {
    return items
        .flatMap((item, index) => [
            item.component ? (
                <Route
                    key={index}
                    path={item.path}
                    element={<item.component />} //React.createElement(item.component)}
                />
            ) : null,
            item.children ? generateRoutes(item.children) : null,
        ])
        .filter(Boolean) as JSX.Element[];
};
