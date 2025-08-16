import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import path from 'path';
import { sidevuiThemePlugin } from './vite-plugin-sidevui.js';

export default defineConfig({
    plugins: [
        sidevuiThemePlugin()
    ],
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['import'],
            }
        },
        transformer: 'lightningcss',
        lightningcss: {
            targets: browserslistToTargets(
                browserslist('>= 0.25%')
            ),
        },
		postcss: {
			plugins: [
				autoprefixer()
			]
		}
    },
	resolve: {
        alias: {
            '~': path.resolve(__dirname, 'node_modules'),
            '@img': path.resolve(__dirname, 'assets/img'),
            '@js': path.resolve(__dirname, 'assets/js'),
            '@scss': path.resolve(__dirname, 'assets/scss'),
        }
    },
	server: {
		port: 5173,
		host: 'localhost',
		watch: {
			disableGlobbing: false,
			usePolling: false,
		}
	},
    build: {
        copyPublicDir: false,
        rollupOptions: {
            input: {
                theme: './src/theme.css',
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
