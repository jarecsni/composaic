import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import alias from '@rollup/plugin-alias';
// import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path';
import federation from '@originjs/vite-plugin-federation';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['@babel/plugin-syntax-import-attributes'],
            },
        }),
        federation({
            name: 'TestPlugins',
            filename: 'TestPlugins.js',
            exposes: {
                './SimpleLogger': './src/plugins/simplelogger/SimpleLogger.ts',
            },
            shared: ['react'],
        }),
        alias({
            entries: [
                {
                    find: '@composaic',
                    replacement: resolve(__dirname, '../../src'),
                },
                {
                    find: '@',
                    replacement: resolve(__dirname, './src'),
                },
            ],
        }),
        viteStaticCopy({
            targets: [{ src: './manifest.json', dest: '.' }],
        }),
    ],
    preview: {
        port: 9000,
    },
    build: {
        target: 'esnext',
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
        },
    },
});
