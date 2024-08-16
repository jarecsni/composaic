import { Plugin } from '../../types';

export type PluginViewDefinition = {
    container: string;
    components: string[];
    plugin: string;
};

export type ViewDefinition = {
    container: string;
    components: {
        component: string;
        plugin: string;
    }[];
};
/**
 * Views extension point.
 */
export interface ViewExtensionPoint {
    getViewDefinitions(): ViewDefinition[];
}

export class ViewsPlugin extends Plugin {
    private viewsDefinitons: ViewDefinition[] = [];

    async start() {
        super.start();
        // Collect navbar items from all connected extensions
        const pluginViewsDefinitons: PluginViewDefinition[] = [];
        this.getConnectedExtensions('views').forEach((extension) => {
            const navBarMeta = extension.meta! as PluginViewDefinition[];
            for (const item of navBarMeta) {
                item.plugin = extension.plugin;
                pluginViewsDefinitons.push(item);
            }
        });
        this.viewsDefinitons = this.consolidateViews(pluginViewsDefinitons);
    }

    consolidateViews(
        pluginViewDefinitions: PluginViewDefinition[]
    ): ViewDefinition[] {
        const viewDefinitions: ViewDefinition[] = [];
        pluginViewDefinitions.forEach((pluginViewDefinition) => {
            const existingViewDefinition = viewDefinitions.find(
                (viewDefinition) =>
                    viewDefinition.container === pluginViewDefinition.container
            );
            if (existingViewDefinition) {
                pluginViewDefinition.components.forEach((component) => {
                    existingViewDefinition.components.push({
                        component: component,
                        plugin: pluginViewDefinition.plugin,
                    });
                });
            } else {
                viewDefinitions.push({
                    container: pluginViewDefinition.container,
                    components: pluginViewDefinition.components.map(
                        (component) => {
                            return {
                                component: component,
                                plugin: pluginViewDefinition.plugin,
                            };
                        }
                    ),
                });
            }
        });
        return viewDefinitions;
    }

    async stop() {
        // Clear navbar items or any other cleanup
        this.viewsDefinitons = [];
    }

    public getViewDefinitions(): ViewDefinition[] {
        return this.viewsDefinitons;
    }
}

// TODO: This is unnecessary as the information is provided by the manifest
export class SimpleViewsExtension implements ViewExtensionPoint {
    getViewDefinitions(): ViewDefinition[] {
        return [];
    }
}
