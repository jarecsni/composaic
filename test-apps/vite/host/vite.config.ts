import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import alias from '@rollup/plugin-alias'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

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
        alias({
            entries: [
                {
                    find: '@composaic',
                    replacement: resolve(__dirname, '../../../src'),
                },
                {
                    find: '@',
                    replacement: resolve(__dirname, './src'),
                },
            ],
        }),
    ],
    build: {
        target: 'esnext',
    },
})
