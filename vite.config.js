import autoprefixer from "autoprefixer";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import path from "node:path";
import { defineConfig } from "vite";

const projectRoot = import.meta.dirname;

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
			"~": path.resolve(projectRoot, "node_modules"),
			"@img": path.resolve(projectRoot, "assets/img"),
			"@js": path.resolve(projectRoot, "src/js"),
			"@scss": path.resolve(projectRoot, "src/scss"),
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
				style: "./myui.config.scss",
			},
			output: {
				dir: path.resolve(projectRoot, "dist"),
				format: "es",
				entryFileNames: `js/[name].js`,
				chunkFileNames: `js/[name].js`,
				assetFileNames: `css/[name].[ext]`,
			},
		},
	},
});
