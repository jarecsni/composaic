import React, { FC } from 'react';
import { PluginManager } from '../plugins/PluginManager';
import { config } from '../config';

type ENV = 'development' | 'production';

const env: ENV = (process.env.NODE_ENV as ENV) || 'development'

console.log('Env id:', config[env].id);

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
    extensions: [
        {
            plugin: 'self',
            id: 'MyCoolExtension',
            className: 'SimpleCoolExtensionProvider',
        },
    ],
});

PluginManager.getInstance()
    .loadPlugin('@foo/bar')
    .then((plugin) => {
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
