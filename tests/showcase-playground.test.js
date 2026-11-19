import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
	document.body.innerHTML = "";
	vi.resetModules();
});

async function mount() {
	document.body.innerHTML = `<form id="playground-controls"><strong id="playground-component-name"></strong><span id="playground-component-index"></span><select id="playground-component"><option value="button">Button</option><option value="badge">Badge</option><option value="alert">Alert</option></select><select id="playground-variant"><option value="primary">Primary</option></select><select id="playground-size"><option>xs</option><option selected>md</option></select><div id="playground-state-field"><select id="playground-state"><option value="normal">Normal</option><option value="hover">Hover</option><option value="disabled">Disabled</option><option value="loading">Loading</option></select></div></form><div id="playground-sample"></div><p id="playground-state-label"></p><code id="playground-code"></code><button id="playground-copy">Copy</button><span id="playground-copy-status"></span><button id="tab-html" data-code-tab="html"></button><button id="tab-sass" data-code-tab="sass"></button>`;
	await import("../src/js/showcase-playground.js");
	return {
		component: document.querySelector("#playground-component"),
		variant: document.querySelector("#playground-variant"),
		state: document.querySelector("#playground-state"),
		stateField: document.querySelector("#playground-state-field"),
		sample: document.querySelector("#playground-sample"),
		code: document.querySelector("#playground-code"),
		tabs: document.querySelectorAll("[data-code-tab]"),
	};
}

describe("Showcase playground", () => {
	it("updates the selected component, allowed variants, live preview, and code", async () => {
		const ui = await mount();
		expect(ui.sample.querySelector("button").className).toBe(
			"btn btn--primary btn--md",
		);
		ui.component.value = "badge";
		ui.component.dispatchEvent(new Event("change", { bubbles: true }));
		expect(
			document.querySelector("#playground-component-name").textContent,
		).toBe("Badge");
		expect(ui.stateField.hidden).toBe(true);
		expect([...ui.variant.options].map((option) => option.value)).toEqual([
			"primary",
			"secondary",
			"success",
			"warning",
			"danger",
			"info",
		]);
		expect(ui.sample.querySelector("span.badge--primary")).not.toBeNull();
		expect(ui.code.textContent).toContain("badge--primary");
	});

	it("renders loading state and Sass snippet", async () => {
		const ui = await mount();
		ui.state.value = "loading";
		ui.state.dispatchEvent(new Event("change", { bubbles: true }));
		const button = ui.sample.querySelector("button");
		expect(button.classList.contains("btn--loading")).toBe(true);
		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(ui.code.textContent).toContain("btn__spinner");
		ui.tabs[1].click();
		expect(ui.tabs[1].getAttribute("aria-selected")).toBe("true");
		expect(ui.code.textContent).toMatch(/@use/);
	});

	it("uses the chosen semantic color for simulated states and copies the active snippet", async () => {
		const ui = await mount();
		ui.variant.add(new Option("Success", "success"));
		ui.variant.value = "success";
		ui.state.value = "hover";
		ui.state.dispatchEvent(new Event("change", { bubbles: true }));
		const preview = ui.sample.querySelector("button");
		expect(
			preview.style.getPropertyValue("--playground-interaction-color"),
		).toBe("var(--color-success-hover)");

		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});
		document.querySelector("#playground-copy").click();
		await vi.waitFor(() =>
			expect(writeText).toHaveBeenCalledWith(ui.code.textContent),
		);
		expect(
			document.querySelector("#playground-copy-status").textContent,
		).toMatch(/copié/i);
	});

	it("provides a runtime token snippet for accent variants", async () => {
		const ui = await mount();
		ui.variant.add(new Option("Soft blue", "soft-blue"));
		ui.variant.value = "soft-blue";
		ui.variant.dispatchEvent(new Event("change", { bubbles: true }));
		ui.tabs[1].click();
		expect(ui.code.textContent).toContain("--accent-blue-soft");
		expect(ui.code.textContent).toContain("--accent-blue-high");
	});
});
