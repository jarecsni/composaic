import React, { FC } from 'react';
import { PluginManager } from '../plugins/PluginManager';
// @ts-expect-error - this is not working in VScode
import corePlugins from '../plugins/core-plugins.json';

PluginManager.getInstance().addPluginDefinitions(corePlugins);

const SimpleComponent: FC = () => {
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
};

export default SimpleComponent;
