import React, { FC, useEffect } from 'react';
import { PluginManager } from '../plugins/PluginManager';
import corePlugins from '../plugins/core-plugins.json';
import { PluginManifest } from '../plugins/types';
import { convertManifestToPluginDescriptor } from './plugin-utils';
import { App } from '../core/App';

PluginManager.getInstance().addPluginDefinitions(corePlugins);

interface DevContainerProps {
    loadModule(moduleName: string, pkg: string): Promise<object>;
}

const processManifest = async (
    manifest: PluginManifest,
    loadModule: DevContainerProps['loadModule']
) => {
    const pluginDescriptors = convertManifestToPluginDescriptor(manifest);
    for (const pluginDescriptor of pluginDescriptors) {
        pluginDescriptor.loadedModule = await loadModule(
            pluginDescriptor.module,
            pluginDescriptor.package
        );
    }
    PluginManager.getInstance().addPluginDefinitions(pluginDescriptors);
};

export const DevContainer: FC<DevContainerProps> = ({ loadModule }) => {
    useEffect(() => {
        fetch('/manifest.json').then((response) => {
            response.json().then(async (json) => {
                await processManifest(json, loadModule);
                const simpleLoggerPlugin =
                    await PluginManager.getInstance().getPlugin(
                        '@composaic-tests/simple-logger'
                    );
                // @ts-expect-error
                simpleLoggerPlugin.log('Hello, world from SimpleLoggerPlugin!');
            });
        });
    }, []);
    return <App />;
};
