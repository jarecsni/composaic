import React, { FC, useEffect, useState } from 'react';
import { PluginManager } from '../plugins/PluginManager';
// @ts-expect-error - this is not working in VScode
import corePlugins from '../plugins/core-plugins.json';
import { PluginManifest } from '../plugins/types';

PluginManager.getInstance().addPluginDefinitions(corePlugins);

interface DevContainerProps {
    manifest: PluginManifest;
    loadModule(moduleName: string, pkg: string): Promise<object>;
}

export const DevContainer: FC<DevContainerProps> = ({ loadModule }) => {
    const [manifest, setManifest] = useState({});
    useEffect(() => {
        fetch('/manifest.json').then((response) => {
            response.json().then((json) => {
                console.log('setting manifest', json);
                setManifest(json);
            });
        });
    }, []);
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
};
