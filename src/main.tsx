import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './core/App';
import { ConfigurationService } from './services/configuration';
import './index.css';

console.log('Env:', process.env.NODE_ENV);
ConfigurationService.getInstance().getConfiguration().remotes.forEach(async (remote) => {
    console.log('Remote:', remote);
    const manifest = await fetch(remote + '/manifest.json');
    console.log('Manifest:', await manifest.json());
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
