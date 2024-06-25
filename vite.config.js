import {defineConfig} from "vite";
import path from 'path';

export default defineConfig({
    root: './',
    build: {
        copyPublicDir: false,
        rollupOptions: {
            input: {
                style: './assets/scss/style.scss',
                app: './assets/js/app.js',
            },
            output: {
                dir: path.resolve(__dirname, 'dist'),
                format: 'es',
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        }
    }
});