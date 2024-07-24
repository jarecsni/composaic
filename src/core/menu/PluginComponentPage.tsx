import React from 'react';

interface PluginComponentPageProps {
    component: string;
    plugin: string;
}

const PluginComponentPage: React.FC<PluginComponentPageProps> = ({
    plugin,
    component,
}) => {
    return (
        <div>
            <h1>{plugin + ':' + component}</h1>
            <p>This page will load the component for this route.</p>
        </div>
    );
};

export default PluginComponentPage;
