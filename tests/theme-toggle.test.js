import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../src/js/features/theme-toggle.js";

afterEach(() => {
	ThemeToggle.destroy();
	ThemeToggle.reset();
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
	vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
	it("persists theme choices and follows system preference after reset", () => {
		const mediaListeners = new Set();
		const mediaQuery = {
			matches: false,
			addEventListener: vi.fn((_type, listener) =>
				mediaListeners.add(listener),
			),
			removeEventListener: vi.fn((_type, listener) =>
				mediaListeners.delete(listener),
			),
		};
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => mediaQuery),
		);
		document.body.innerHTML = "<button data-theme-toggle>Theme</button>";
		const button = document.querySelector("[data-theme-toggle]");

		ThemeToggle.init();
		ThemeToggle.init();
		expect(ThemeToggle.current).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");

		button.click();
		expect(ThemeToggle.current).toBe("dark");
		expect(localStorage.getItem("myui-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");

		const changed = vi.fn();
		document.addEventListener("theme:change", changed, { once: true });
		ThemeToggle.set("light");
		expect(changed).toHaveBeenCalledOnce();

		mediaQuery.matches = true;
		ThemeToggle.reset();
		expect(ThemeToggle.current).toBe("dark");
		expect(localStorage.getItem("myui-theme")).toBeNull();
		for (const listener of mediaListeners) listener({ matches: false });
		expect(ThemeToggle.current).toBe("light");

		ThemeToggle.destroy();
		expect(mediaQuery.removeEventListener).toHaveBeenCalledOnce();
	});
});
