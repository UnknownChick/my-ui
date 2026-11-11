/**
 * Theme Toggle — manages dark/light theme switching with persistence.
 *
 * Reads/writes `data-theme` on <html> and stores preference in localStorage.
 * Falls back to system preference via `prefers-color-scheme`.
 *
 * @example
 * // Initialize delegated [data-theme-toggle] buttons
 * ThemeToggle.init();
 *
 * // Or use programmatically:
 * import { ThemeToggle } from './features/theme-toggle';
 * ThemeToggle.set('dark');
 * ThemeToggle.toggle();
 * const current = ThemeToggle.current; // 'light' | 'dark'
 */

const STORAGE_KEY = "myui-theme";
const ATTR = "data-theme";

function getMediaQuery() {
	return (
		globalThis.window?.matchMedia?.("(prefers-color-scheme: dark)") || null
	);
}

function getSystemPreference() {
	return getMediaQuery()?.matches ? "dark" : "light";
}

function getStorage() {
	try {
		return globalThis.localStorage;
	} catch {
		return null;
	}
}

function getSavedTheme() {
	try {
		return getStorage()?.getItem(STORAGE_KEY) || null;
	} catch {
		return null;
	}
}

function applyTheme(theme) {
	document.documentElement.setAttribute(ATTR, theme);
	document.documentElement.style.colorScheme = theme;
}

let initialized = false;
let mediaQuery;
let mediaHandler;
let clickHandler;

export const ThemeToggle = {
	/** Current resolved theme */
	get current() {
		if (typeof document === "undefined") {
			return getSavedTheme() || getSystemPreference();
		}
		const theme = document.documentElement.getAttribute(ATTR);
		if (theme === "white") return "light";
		return theme || getSystemPreference();
	},

	/** Initialize theme from localStorage or system preference */
	init() {
		if (initialized) return;
		initialized = true;
		if (typeof document === "undefined") return;
		const saved = getSavedTheme();
		const theme = saved || getSystemPreference();
		applyTheme(theme);

		// Listen for system preference changes (only when no explicit user choice)
		mediaQuery = getMediaQuery();
		mediaHandler = (e) => {
			if (!getSavedTheme()) {
				applyTheme(e.matches ? "dark" : "light");
			}
		};
		mediaQuery?.addEventListener("change", mediaHandler);

		clickHandler = (event) => {
			if (event.target.closest?.("[data-theme-toggle]")) ThemeToggle.toggle();
		};
		document.addEventListener("click", clickHandler);
	},

	/** Remove listeners installed by init; safe to call repeatedly. */
	destroy() {
		if (!initialized) return;
		initialized = false;
		mediaQuery?.removeEventListener("change", mediaHandler);
		document.removeEventListener("click", clickHandler);
		mediaQuery = undefined;
		mediaHandler = undefined;
		clickHandler = undefined;
	},

	/** Set a specific theme */
	set(theme) {
		if (theme !== "light" && theme !== "dark") return;
		try {
			getStorage()?.setItem(STORAGE_KEY, theme);
		} catch {
			// Theme switching still works when storage is disabled.
		}
		if (typeof document === "undefined") return;
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
		try {
			getStorage()?.removeItem(STORAGE_KEY);
		} catch {
			// Reset still falls back to the system preference when storage is disabled.
		}
		if (typeof document !== "undefined") applyTheme(getSystemPreference());
	},
};
