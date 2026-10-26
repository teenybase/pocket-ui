import { defineConfig }           from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync }           from 'node:fs';
import { uiConfig }               from './ui.config';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// see https://vitejs.dev/config
export default defineConfig(({ mode }) => ({
    server: {
        port: 3000,
    },
    // build settings from ui.config.ts (no .env files)
    define: Object.fromEntries(Object.entries(uiConfig(mode, version)).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])),
    base: './',
    build: {
        chunkSizeWarningLimit: 1000,
        reportCompressedSize: false,
    },
    plugins: [
        svelte({
            preprocess: [vitePreprocess({script: true})],
            onwarn: (warning, handler) => {
                if (warning.code.startsWith('a11y-')) {
                    return; // silence a11y warnings
                }
                handler?.(warning);
            },
        }),
    ],
    resolve: {
        alias: {
            '@': __dirname + '/src',
        }
    },
}))
