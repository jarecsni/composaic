import React from 'react';

interface PluginComponentPageProps {
    title: string;
}

export const PluginComponentPage: React.FC<PluginComponentPageProps> = ({
    title,
}) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>This page will load the component for this route.</p>
        </div>
    );
};
