import autoprefixer from "autoprefixer";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
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
