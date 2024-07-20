import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
    __federation_method_getRemote,
    __federation_method_setRemote,
    // @ts-expect-error: this is a private API
} from '__federation__';
import { App } from './core/App';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
