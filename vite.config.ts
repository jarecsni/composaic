import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'app',
            remotes: {
                // module federation is being handled dynamically. see app.tsx
                // add dummy.js to prevent vite from throwing an error
                dummy: 'dummy.js',
            },
            // cannot add modules which are not installed
            shared: ['react'],
        }),
    ],
    build: {
        target: 'esnext',
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
});
