import React from 'react';

interface PluginComponentPageProps {
    label: string;
}

const PluginComponentPage: React.FC<PluginComponentPageProps> = ({
    label = 'Plugin Component Page',
}) => {
    return (
        <div>
            <h1>{label}</h1>
            <p>This page will load the component for this route.</p>
        </div>
    );
};

export default PluginComponentPage