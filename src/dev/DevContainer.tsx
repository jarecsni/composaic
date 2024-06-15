import React, { FC } from 'react';
import { PluginManager } from '../plugins/PluginManager';

PluginManager.getInstance().addPlugin({
    module: 'BarPluginModule',
    plugin: '@foo/bar',
    version: '1.0',
    description: 'bar',
    extensionPoints: [
        {
            id: 'MyCoolExtension',
            type: 'MyCoolExtensionType',
        },
    ],
});

PluginManager.getInstance().loadPlugin('@foo/bar').then((plugin) => {
    console.log('Loaded plugin:', plugin);
});

const SimpleComponent: FC = () => {
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
};

export default SimpleComponent;
