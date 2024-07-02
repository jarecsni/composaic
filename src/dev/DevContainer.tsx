import React, { FC, useEffect } from 'react';
import { PluginManager } from '../plugins/PluginManager';
// @ts-expect-error - this is not working in VScode
import corePlugins from '../plugins/core-plugins.json';
import { PluginManifest } from '../plugins/types';

PluginManager.getInstance().addPluginDefinitions(corePlugins);

interface DevContainerProps {
    manifest: PluginManifest;
    loadModule(moduleName: string, pkg: string): Promise<object>;
}

export const DevContainer: FC<DevContainerProps> = ({ manifest, loadModule }) => {
    console.log('DevContainer', JSON.stringify(manifest));
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
};

