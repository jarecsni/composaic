import React, { useEffect, useState } from 'react';
import { PluginManager } from '../../plugins/PluginManager';

interface PluginComponentPageProps {
    component: string;
    plugin: string;
}

const PluginComponentPage: React.FC<PluginComponentPageProps> = ({
    plugin,
    component,
}) => {
    const [PluginComponent, setPluginComponent] = useState<React.FC>(() => () => <div>Loading...</div>);

    useEffect(() => {
        PluginManager.getInstance().getPlugin(plugin).then((plugin) => {
            const loadedComponent = plugin.getModule(component);
            // @ts-ignore
            setPluginComponent(() => loadedComponent);
        });
    }, [plugin, component]);
    return (
        <div>
            <h1>{plugin + ':' + component}</h1>
            <PluginComponent />
        </div>
    );
};

export default PluginComponentPage;
