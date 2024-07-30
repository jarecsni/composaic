// Assuming necessary imports based on the LoggerPlugin example
import { Plugin } from '../../types';

// Components exposed by this plugin module
export { Example1Page } from './Example1Page';
export { Example2Page } from './Example2Page';

// Define a hypothetical NavbarItem type for demonstration
export type NavbarItem = {
    label: string;
    path: string;
    component: string;
    children: NavbarItem[];
    plugin: string;
};

/**
 * Navbar extension point.
 *
 * Extensions for this extension point will need to implement these methods.
 */
export interface NavbarExtensionPoint {
    getNavbarItems(): NavbarItem[];
}

export class NavbarPlugin extends Plugin {
    private navbarItems: NavbarItem[] = [];

    async start() {
        // Collect navbar items from all connected extensions
        this.navbarItems = [];
        this.getConnectedExtensions('navbarItem').forEach((extension) => {
            const navBarMeta = extension.meta! as NavbarItem[];
            for (const item of navBarMeta) {
                item.plugin = extension.plugin;
                this.navbarItems.push(item);
            }
        });
    }

    async stop() {
        // Clear navbar items or any other cleanup
        this.navbarItems = [];
    }

    public getNavbarItems(): NavbarItem[] {
        return this.navbarItems;
    }
}

export class SimpleNavbarExtension implements NavbarExtensionPoint {
    getNavbarItems(): NavbarItem[] {
        return [];
    }
}
