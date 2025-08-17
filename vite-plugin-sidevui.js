import { writeFile } from "fs/promises";
import path from "path";

const mapTheme = ([key, value]) => {
	if (typeof value === "string") {
		return `--${key}: ${value}`;
	}

	return Object.entries(value).flatMap(([nestedKey, nestedValue]) => {
		const newKey = nestedKey === "DEFAULT" ? key : `${key}-${nestedKey}`;

		return mapTheme([newKey, nestedValue]);
	});
};

const buildTheme = async (configPath) => {
	try {
		// Utiliser import dynamique avec timestamp pour éviter le cache
		const configUrl = `file:///${configPath.replace(/\\/g, "/")}?t=${Date.now()}`;
		const { default: sidevuiConfig } = await import(configUrl);

		const result = Object.entries(sidevuiConfig).flatMap(mapTheme);
		let content = result.map((line) => `\t${line};`);
		content = [":root {", ...content, "}"].join("\n");

		await writeFile("src/theme.css", content, { encoding: "utf-8" });
		console.log("✓ CSS theme file updated");
	} catch (e) {
		console.error("Error building theme:", e);
	}
};

export function sidevuiThemePlugin() {
	return {
		name: "sidevui-theme",
		configureServer(server) {
			const configPath = path.resolve(process.cwd(), "sidevui.config.js");

			// Générer le thème au démarrage
			buildTheme(configPath);

			// Surveiller les changements du fichier config
			server.watcher.add(configPath);

			server.watcher.on("change", (file) => {
				if (file === configPath) {
					console.log("📝 sidevui.config.js changed, regenerating theme...");
					buildTheme(configPath);

					// Déclencher un rechargement de la page
					server.ws.send({
						type: "full-reload",
					});
				}
			});
		},
	};
}
