/**
 * Theme Toggle — manages dark/light theme switching with persistence.
 *
 * Reads/writes `data-theme` on <html> and stores preference in localStorage.
 * Falls back to system preference via `prefers-color-scheme`.
 *
 * @example
 * // Auto-init: toggles with [data-theme-toggle] buttons
 * import './features/theme-toggle';
 *
 * // Or use programmatically:
 * import { ThemeToggle } from './features/theme-toggle';
 * ThemeToggle.set('dark');
 * ThemeToggle.toggle();
 * const current = ThemeToggle.current; // 'light' | 'dark'
 */

const STORAGE_KEY = "myui-theme";
const ATTR = "data-theme";

function getSystemPreference() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme) {
	document.documentElement.setAttribute(ATTR, theme);
	document.documentElement.style.colorScheme = theme;
}

export const ThemeToggle = {
	/** Current resolved theme */
	get current() {
		return document.documentElement.getAttribute(ATTR) || getSystemPreference();
	},

	/** Initialize theme from localStorage or system preference */
	init() {
		const saved = localStorage.getItem(STORAGE_KEY);
		const theme = saved || getSystemPreference();
		applyTheme(theme);

		// Listen for system preference changes (only when no explicit user choice)
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (e) => {
				if (!localStorage.getItem(STORAGE_KEY)) {
					applyTheme(e.matches ? "dark" : "light");
				}
			});

		// Auto-bind toggle buttons
		document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
			btn.addEventListener("click", () => ThemeToggle.toggle());
		});
	},

	/** Set a specific theme */
	set(theme) {
		if (theme !== "light" && theme !== "dark") return;
		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
		document.dispatchEvent(
			new CustomEvent("theme:change", { detail: { theme } }),
		);
	},

	/** Toggle between light and dark */
	toggle() {
		ThemeToggle.set(ThemeToggle.current === "dark" ? "light" : "dark");
	},

	/** Reset to system preference */
	reset() {
		localStorage.removeItem(STORAGE_KEY);
		applyTheme(getSystemPreference());
	},
};

// Auto-init on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => ThemeToggle.init());
} else {
	ThemeToggle.init();
}
