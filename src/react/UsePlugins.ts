import { useState, useEffect } from 'react';
import { PluginManager } from '../plugins/PluginManager.js';
import { Plugin } from '../plugins/types.js';

export function usePlugins(pluginIds: string[]): Plugin[] {
    const [plugins, setPlugins] = useState<Plugin[]>([]);

    useEffect(() => {
        // Function to update the state with the current plugin data
        const updatePlugins = async () => {
            const pluginManager = PluginManager.getInstance();
            const currentPlugins = await Promise.all(
                pluginIds.map((id) => pluginManager.getPlugin(id))
            );
            setPlugins(currentPlugins);
        };

        // Register the listener
        const unsubscribe =
            PluginManager.getInstance().registerPluginChangeListener(
                pluginIds,
                updatePlugins
            );

        // Cleanup function to unsubscribe the listener on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return plugins;
}

export default usePlugins;
