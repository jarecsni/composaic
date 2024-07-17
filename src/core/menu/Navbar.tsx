// components/Navbar.tsx
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';

const Navbar: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    My Application
                </Typography>
                <Button color="inherit" component={RouterLink} to="/">
                    Home
                </Button>
                <Button color="inherit" onClick={handleClick}>
                    Services
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem
                        onClick={handleClose}
                        component={RouterLink}
                        to="/service1"
                    >
                        Service 1
                    </MenuItem>
                    <MenuItem
                        onClick={handleClose}
                        component={RouterLink}
                        to="/service2"
                    >
                        Service 2
                    </MenuItem>
                    {/* Add more submenus as needed */}
                </Menu>
                <Button color="inherit" component={RouterLink} to="/about">
                    About
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
