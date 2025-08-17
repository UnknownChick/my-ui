import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import { browserslistToTargets } from "lightningcss";
import browserslist from "browserslist";
import { purgeCSSPlugin } from "@fullhuman/postcss-purgecss";
import path from "path";
import { sidevuiThemePlugin } from "./vite-plugin-sidevui.js";

export default defineConfig({
	plugins: [sidevuiThemePlugin()],
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true,
				silenceDeprecations: ["import"],
			},
		},
		transformer: "lightningcss",
		lightningcss: {
			targets: browserslistToTargets(browserslist()),
		},
		postcss: {
			plugins: [autoprefixer()],
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "node_modules"),
			"@img": path.resolve(__dirname, "assets/img"),
			"@js": path.resolve(__dirname, "src/js"),
			"@scss": path.resolve(__dirname, "src/scss"),
		},
	},
	server: {
		port: 5173,
		host: "localhost",
		watch: {
			disableGlobbing: false,
			usePolling: false,
		},
	},
	build: {
		copyPublicDir: false,
		rollupOptions: {
			input: {
				js: "./src/js/index.js",
				style: "./src/scss/index.scss",
				theme: "./src/theme.css",
			},
			output: {
				dir: path.resolve(__dirname, "dist"),
				format: "es",
				entryFileNames: `js/[name].js`,
				chunkFileNames: `js/[name].js`,
				assetFileNames: `css/[name].[ext]`,
			},
		},
	},
});
