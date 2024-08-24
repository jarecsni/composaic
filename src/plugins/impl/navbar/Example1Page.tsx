import React, { useEffect, useState } from 'react';
import { ViewsPlugin } from '../views';
import { RemotePluginManager } from '../../RemotePluginManager';

export const Example1Page: React.FC = () => {
    const [pluginComponents, setPluginComponents] = useState<React.FC[]>([]);

    useEffect(() => {
        // Assuming PluginManager has a method getPlugin to get a plugin by name
        // and the plugin has a method getViewsByContext to get views by context
        RemotePluginManager.getInstance().getPlugin('@composaic/views').then((viewsPlugin) => {
            if (viewsPlugin) {
                const { components } = (
                    viewsPlugin as ViewsPlugin
                ).getViewsByContainer('sample.container') || { components: [] };
                const componentPromises = components.map(({ component, plugin }) => {
                    return RemotePluginManager.getInstance().getPlugin(plugin).then((pluginInstance) => {
                        if (!pluginInstance) {
                            return Promise.reject(new Error(`Plugin ${plugin} not found`));
                        }
                        // Assuming the plugin instance has a method to dynamically import components by identifier
                        return pluginInstance.getModule(component);
                    });
                });

                Promise.all(componentPromises).then(loadedComponents => {
                    // @ts-expect-error - FIXME: This is a hack
                    setPluginComponents(loadedComponents.filter(c => c)); // Filter out any undefined components
                }).catch(error => console.error("Error loading components:", error));
            }
        });
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div>
            {pluginComponents.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};
