import React, { useEffect, useState } from 'react';
import { PluginManager } from '../../PluginManager';
import { ViewDefinition, ViewsPlugin } from '../views';

export const Example1Page: React.FC = () => {
    const [viewDefinition, setViewDefinition] = useState<
        ViewDefinition | undefined
    >(undefined);

    useEffect(() => {
        // Assuming PluginManager has a method getPlugin to get a plugin by name
        // and the plugin has a method getViewsByContext to get views by context
        const pluginManager = PluginManager.getInstance(); // Or however you access PluginManager
        pluginManager.getPlugin('@composaic/views').then((viewsPlugin) => {
            if (viewsPlugin) {
                const containerViewDefinition = (
                    viewsPlugin as ViewsPlugin
                ).getViewsByContainer('sample.container');
                setViewDefinition(containerViewDefinition);
            }
        });
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div>
            Example1Page
            <div>
                {viewDefinition &&
                    viewDefinition.components.map((component) => {
                        return (
                            <div key={component.plugin}>
                                <div>Plugin: {component.plugin}</div>
                                <div>Component: {component.component}</div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
