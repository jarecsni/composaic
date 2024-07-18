import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Define the menu item model
interface MenuItemModel {
    label: string;
    path: string;
    children?: MenuItemModel[];
}

// Sample menu model
const menuItems: MenuItemModel[] = [
    { label: 'Home', path: '/' },
    {
        label: 'Services',
        path: '/services',
        children: [
            { label: 'Service 1', path: '/service1' },
            { label: 'Service 2', path: '/service2' },
            // Add more submenus as needed
        ],
    },
    { label: 'About', path: '/about' },
];

// Recursive Menu Item Component
const RecursiveMenuItem: React.FC<{ item: MenuItemModel; handleClose: () => void }> = ({ item, handleClose }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        handleClose();
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        handleClose();
    };

    return (
        <>
            <Button color="inherit" component={RouterLink} to={item.path} onClick={(event: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLAnchorElement>) => handleClick(event as React.MouseEvent<HTMLButtonElement>)}>
                {item.label}
            </Button>
            {item.children && (
                <Menu
                    id={`submenu-${item.label}`}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                >
                    {item.children.map((child, index) => (
                        // Recursively call RecursiveMenuItem for each child
                        <RecursiveMenuItem key={index} item={child} handleClose={handleCloseMenu} />
                    ))}
                </Menu>
            )}
        </>
    );
};

// Navbar Component
export const Navbar: React.FC = () => {
    const handleClose = () => {
        // This function would handle closing all open menus, if necessary
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    My Application
                </Typography>
                {menuItems.map((item, index) => (
                    <RecursiveMenuItem key={index} item={item} handleClose={handleClose} />
                ))}
            </Toolbar>
        </AppBar>
    );
};
