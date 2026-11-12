import { afterEach, describe, expect, it } from "vitest";
import Dropdown from "../src/js/components/dropdown.js";

afterEach(() => {
	document.body.innerHTML = "";
});

describe("Dropdown", () => {
	it("opens, closes on outside click, emits events, and cleans up", () => {
		document.body.innerHTML = `
			<div class="dropdown">
				<button class="dropdown__toggle">Menu</button>
				<div class="dropdown__content"><a href="#one">One</a></div>
			</div><button id="outside">Outside</button>`;
		const root = document.querySelector(".dropdown");
		const toggle = root.querySelector(".dropdown__toggle");
		const events = [];
		root.addEventListener("dropdown:open", (event) => events.push(event.type));
		root.addEventListener("dropdown:close", (event) => events.push(event.type));
		const dropdown = new Dropdown(root);

		toggle.click();
		expect(root.classList.contains("dropdown--open")).toBe(true);
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		expect(toggle.getAttribute("aria-controls")).toBe(
			root.querySelector(".dropdown__content").id,
		);

		document.querySelector("#outside").click();
		expect(root.classList.contains("dropdown--open")).toBe(false);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(events).toEqual(["dropdown:open", "dropdown:close"]);

		dropdown.destroy();
		expect(Dropdown.getInstance(root)).toBeUndefined();
		toggle.click();
		expect(root.classList.contains("dropdown--open")).toBe(false);
		expect(events).toEqual(["dropdown:open", "dropdown:close"]);
	});

	it("supports keyboard opening, item navigation, Escape, and idempotent setup", () => {
		document.body.innerHTML = `
			<div class="dropdown">
				<button class="dropdown__toggle">Menu</button>
				<div class="dropdown__content"><a href="#one">One</a><a href="#two">Two</a></div>
			</div>`;
		const root = document.querySelector(".dropdown");
		const toggle = root.querySelector(".dropdown__toggle");
		const content = root.querySelector(".dropdown__content");
		const [first, second] = content.querySelectorAll("a");
		const dropdown = Dropdown.getOrCreate(root);

		expect(Dropdown.autoInit(".dropdown")[0]).toBe(dropdown);
		expect(() => new Dropdown(root)).toThrow(/instance already exists/);
		toggle.focus();
		toggle.dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
		);
		expect(document.activeElement).toBe(first);
		content.dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
		);
		expect(document.activeElement).toBe(second);
		content.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
		expect(document.activeElement).toBe(toggle);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		dropdown.destroy();
	});
});
