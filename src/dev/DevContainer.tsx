import React, { FC, useEffect, useRef } from 'react';
import { PluginManager } from '../plugins/PluginManager';
import { PluginManifest } from '../plugins/types';
import { convertManifestToPluginDescriptor } from './plugin-utils';

import { App } from './App';

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
    const isInitialized = useRef(false);

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
        isInitialized.current = true;
    }, []);
    return <App />;
};
