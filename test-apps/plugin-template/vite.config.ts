import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import alias from '@rollup/plugin-alias'
// import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
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
    ],
})

