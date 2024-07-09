import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './core/App';
import { ConfigurationService } from './services/configuration';
import './index.css';

console.log('Env:', process.env.NODE_ENV);
ConfigurationService.getInstance()
    .getConfiguration()
    .remotes.forEach(async (remote) => {
        console.log('Remote:', remote);
        const manifest = await fetch(remote + '/manifest.json');
        console.log('Manifest:', await manifest.json());
        const script = await fetch('http://localhost:9000/TestPlugins.js');
        const scriptText = await script.text();
        console.log('Script:', scriptText);
    });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
