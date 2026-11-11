import { initIcons } from "./features/icons.js";
import { initMyUI } from "./index.js";

function initialize() {
	initMyUI();
	initIcons();
}

// Side-effect entry for script-tag users; index.js stays safe to import on demand.
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
	initialize();
}
