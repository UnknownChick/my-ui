import { afterEach, describe, expect, it } from "vitest";
import Tabs from "../src/js/components/tabs.js";

afterEach(() => {
	document.body.innerHTML = "";
});

describe("Tabs", () => {
	it("sets ARIA relationships, roving focus, and manual keyboard activation", () => {
		document.body.innerHTML = `
			<div class="tabs">
				<div class="tabs__nav">
					<button class="tabs__button">Overview</button>
					<button class="tabs__button">Settings</button>
				</div>
				<div class="tabs__content">
					<div class="tabs__panel">Overview content</div>
					<div class="tabs__panel">Settings content</div>
				</div>
			</div>`;
		const root = document.querySelector(".tabs");
		const nav = root.querySelector(".tabs__nav");
		const [overview, settings] = root.querySelectorAll(".tabs__button");
		const [overviewPanel, settingsPanel] =
			root.querySelectorAll(".tabs__panel");
		const tabs = new Tabs(root, { autoActivate: false });

		expect(nav.getAttribute("role")).toBe("tablist");
		expect(overview.getAttribute("role")).toBe("tab");
		expect(overview.getAttribute("aria-controls")).toBe(overviewPanel.id);
		expect(overviewPanel.getAttribute("aria-labelledby")).toBe(overview.id);
		expect(overview.getAttribute("aria-selected")).toBe("true");
		expect(settingsPanel.hasAttribute("hidden")).toBe(true);

		overview.focus();
		nav.dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
		);
		expect(document.activeElement).toBe(settings);
		expect(settings.getAttribute("aria-selected")).toBe("false");
		nav.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
		expect(settings.getAttribute("aria-selected")).toBe("true");
		expect(overviewPanel.hasAttribute("hidden")).toBe(true);
		expect(settingsPanel.hasAttribute("hidden")).toBe(false);

		tabs.destroy();
		expect(Tabs.getInstance(root)).toBeUndefined();
	});
});
