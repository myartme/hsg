import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import svgLoader from "vite-svg-loader";

export default defineConfig({
    plugins: [
        vue(),
        svgLoader(),
        vueDevTools()
    ],
    css: {
        postcss: {
            plugins: [
                tailwindcss(),
                autoprefixer()
            ]
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    build: {
        outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                preload: path.resolve(__dirname, 'src/preload.js'),
            },
        },
    }
});