import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';
import { App } from './core/App';
import { ConfigurationService } from './services/configuration';
import './index.css';

console.log('Env:', process.env.NODE_ENV);
ConfigurationService.getInstance().getConfiguration().remotes.forEach(async (remote) => {
    console.log('Remote:', remote);
    const manifest = await fetch(remote + '/manifest.json');
    console.log('Manifest:', await manifest.json());

    __federation_method_setRemote('TestPlugins', {
        url: () => Promise.resolve('http://localhost:9000/assets/TestPlugins.js'),
        format: 'esm',
        from: 'vite',
    });
    let comp = null;
    try {
        comp = await __federation_method_getRemote('TestPlugins', './SimpleLogger');
        console.log(comp)
    } catch (error) {
        console.error(error);
        console.error('Error fetching remote', error);
        comp = { default: () => <div>Failed to fetch remote</div> };
    }

});


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
