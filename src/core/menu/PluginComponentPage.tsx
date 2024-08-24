import React, { useEffect, useState } from 'react';
//import { PluginManager } from '../../plugins/PluginManager';
import { RemotePluginManager } from '../../plugins/RemotePluginManager';

interface PluginComponentPageProps {
    component: string;
    plugin: string;
}

const PluginComponentPage: React.FC<PluginComponentPageProps> = ({
    plugin,
    component,
}) => {
    const [PluginComponent, setPluginComponent] = useState<React.FC>(
        () => () => <div>Loading...</div>
    );

    useEffect(() => {
        RemotePluginManager.getInstance()
            .getPlugin(plugin)
            .then((plugin) => {
                const loadedComponent = plugin.getModule(component);
                // @ts-expect-error - FIXME: This is a hack
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
