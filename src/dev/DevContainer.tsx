import React, { FC, useEffect, useState } from 'react';
import { PluginManager } from '../plugins/PluginManager';
// @ts-expect-error - this is not working in VScode
import corePlugins from '../plugins/core-plugins.json';
import { PluginManifest } from '../plugins/types';
import { convertManifestToPluginDescriptor } from './local-plugin-utils';

PluginManager.getInstance().addPluginDefinitions(corePlugins);

interface DevContainerProps {
    loadModule(moduleName: string, pkg: string): Promise<object>;
}

const processManifest = async (manifest: PluginManifest, loadModule: DevContainerProps['loadModule']) => {
    const pluginDescriptors = convertManifestToPluginDescriptor(manifest);
    for (const pluginDescriptor of pluginDescriptors) {
        pluginDescriptor.loadedModule = await loadModule(pluginDescriptor.module, pluginDescriptor.package);
    }
    PluginManager.getInstance().addPluginDefinitions(pluginDescriptors);
};

export const DevContainer: FC<DevContainerProps> = ({ loadModule }) => {
    useEffect(() => {
        fetch('/manifest.json').then((response) => {
            response.json().then((json) => {
                processManifest(json, loadModule);
            });
        });
    }, []);
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
};
