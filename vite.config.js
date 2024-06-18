import {defineConfig} from "vite";

export default defineConfig({
    root: './',
    build: {
        copyPublicDir: false,
        rollupOptions: {
            input: {
                style: './assets/sass/style.scss',
                app: './assets/js/app.js',
            },
            output: {
                format: 'es',
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        }
    }
});