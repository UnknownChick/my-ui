import { afterEach, describe, expect, it, vi } from "vitest";
import Accordion from "../src/js/components/accordion.js";
import Drawer from "../src/js/components/drawer.js";
import Modal from "../src/js/components/modal.js";
import Pagination from "../src/js/components/pagination.js";

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.innerHTML = "";
});

describe("Accordion", () => {
	it("opens and closes natively when reduced motion is enabled", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		document.body.innerHTML = `
			<details class="accordion">
				<summary class="accordion__title">Details</summary>
				<div class="accordion__content">Content</div>
			</details>`;
		const root = document.querySelector(".accordion");
		const events = [];
		root.addEventListener("accordion:open", (event) => events.push(event.type));
		root.addEventListener("accordion:close", (event) =>
			events.push(event.type),
		);
		const accordion = new Accordion(root);

		accordion.open();
		expect(root.open).toBe(true);
		accordion.close();
		expect(root.open).toBe(false);
		expect(root.style.height).toBe("");
		expect(events).toEqual(["accordion:open", "accordion:close"]);
		accordion.destroy();
		expect(Accordion.getInstance(root)).toBeUndefined();
	});

	it("closes the previously opened item in the same named group", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		document.body.innerHTML = `
			<details class="accordion" name="faq" open><summary class="accordion__title">A</summary><div class="accordion__content">A</div></details>
			<details class="accordion" name="faq"><summary class="accordion__title">B</summary><div class="accordion__content">B</div></details>`;
		const [first, second] = document.querySelectorAll("details.accordion");
		const firstAccordion = new Accordion(first);
		const secondAccordion = new Accordion(second);

		secondAccordion.open();
		expect(second.open).toBe(true);
		expect(first.open).toBe(false);

		firstAccordion.destroy();
		secondAccordion.destroy();
	});
});

describe("Drawer", () => {
	it("traps focus, updates trigger state, closes on Escape, and removes its backdrop", () => {
		document.body.innerHTML = `
			<button data-drawer-target="account-drawer">Open</button>
			<aside class="drawer" id="account-drawer" aria-label="Account">
				<button class="drawer__close">Close</button>
				<button class="drawer__last">Last</button>
			</aside>`;
		const trigger = document.querySelector("[data-drawer-target]");
		const drawerElement = document.querySelector(".drawer");
		const [closeButton, lastButton] = drawerElement.querySelectorAll("button");
		const drawer = new Drawer(drawerElement);
		const backdrop = document.querySelector(".drawer__backdrop");

		expect(drawerElement.inert).toBe(true);
		expect(trigger.getAttribute("aria-controls")).toBe(drawerElement.id);
		trigger.click();
		expect(drawerElement.inert).toBe(false);
		expect(drawerElement.getAttribute("aria-hidden")).toBe("false");
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(document.activeElement).toBe(closeButton);
		closeButton.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Tab",
				shiftKey: true,
				bubbles: true,
			}),
		);
		expect(document.activeElement).toBe(lastButton);
		lastButton.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
		);
		expect(document.activeElement).toBe(closeButton);

		document.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
		expect(drawerElement.inert).toBe(true);
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(trigger);
		drawer.destroy();
		expect(backdrop.isConnected).toBe(false);
		expect(Drawer.getInstance(drawerElement)).toBeUndefined();
	});
});

describe("Modal", () => {
	it("opens as a modal, restores focus, and releases scroll lock on close", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		vi.useFakeTimers();
		document.body.innerHTML = `
			<button data-modal-target="confirm-dialog">Open</button>
			<dialog class="modal" id="confirm-dialog" aria-labelledby="confirm-title">
				<h2 id="confirm-title">Confirm</h2>
				<button class="modal__close">Close</button>
			</dialog>`;
		const trigger = document.querySelector("[data-modal-target]");
		const dialog = document.querySelector("dialog");
		const closeButton = dialog.querySelector(".modal__close");
		dialog.showModal = vi.fn(() => {
			dialog.open = true;
		});
		dialog.close = vi.fn(() => {
			dialog.open = false;
		});
		const modal = new Modal(dialog, { animation: null });

		trigger.click();
		vi.runAllTimers();
		expect(dialog.showModal).toHaveBeenCalledOnce();
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(document.body.style.overflow).toBe("hidden");
		expect(document.activeElement).toBe(closeButton);
		closeButton.click();
		expect(dialog.close).toHaveBeenCalledOnce();
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(document.body.style.overflow).toBe("");
		expect(document.activeElement).toBe(trigger);
		modal.destroy();
	});

	it("honors close vetoes and restores the original body scroll styles after destroy", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		document.body.style.overflow = "auto";
		document.body.style.paddingRight = "12px";
		document.body.innerHTML = `<button data-modal-target="veto-dialog">Open</button><dialog class="modal" id="veto-dialog"><button class="modal__close">Close</button></dialog>`;
		const trigger = document.querySelector("[data-modal-target]");
		const dialog = document.querySelector("dialog");
		dialog.showModal = vi.fn(() => {
			dialog.open = true;
		});
		dialog.close = vi.fn(() => {
			dialog.open = false;
		});
		const modal = new Modal(dialog, {
			animation: null,
			onBeforeClose: () => false,
		});
		trigger.click();
		modal.close();
		expect(dialog.open).toBe(true);
		modal.destroy();
		expect(dialog.open).toBe(false);
		expect(document.body.style.overflow).toBe("auto");
		expect(document.body.style.paddingRight).toBe("12px");
	});

	it("wraps Tab focus and honors the close veto", () => {
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		document.body.innerHTML = `
			<button data-modal-target="focus-dialog">Open</button>
			<dialog class="modal" id="focus-dialog"><button id="first">First</button><button id="last">Last</button></dialog>`;
		const dialog = document.querySelector("dialog");
		dialog.showModal = vi.fn(() => {
			dialog.open = true;
		});
		dialog.close = vi.fn(() => {
			dialog.open = false;
		});
		const modal = new Modal(dialog, {
			animation: null,
			onBeforeClose: () => false,
		});
		modal.open(document.querySelector("[data-modal-target]"));
		const first = dialog.querySelector("#first");
		const last = dialog.querySelector("#last");
		last.focus();
		const forwardTab = new KeyboardEvent("keydown", {
			key: "Tab",
			bubbles: true,
			cancelable: true,
		});
		document.dispatchEvent(forwardTab);
		expect(forwardTab.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(first);
		modal.close();
		expect(dialog.open).toBe(true);
		modal.destroy();
	});
});

describe("Pagination", () => {
	it("updates active page, ARIA state, and previous/next boundaries", () => {
		document.body.innerHTML = `
			<nav class="pagination"><ul class="pagination__list">
				<li class="pagination__item"><a class="pagination__link pagination__link--prev" href="#prev">Previous</a></li>
				<li class="pagination__item pagination__item--active"><a class="pagination__link" href="#1" aria-current="page">1</a></li>
				<li class="pagination__item"><a class="pagination__link" href="#2">2</a></li>
				<li class="pagination__item"><a class="pagination__link pagination__link--next" href="#next">Next</a></li>
			</ul></nav>`;
		const root = document.querySelector(".pagination");
		const links = root.querySelectorAll(".pagination__link");
		const pagination = new Pagination(root);
		expect(links[0].getAttribute("aria-disabled")).toBe("true");
		links[2].click();
		expect(links[2].getAttribute("aria-current")).toBe("page");
		expect(links[0].hasAttribute("aria-disabled")).toBe(false);
		links[3].click();
		expect(
			links[2].parentElement.classList.contains("pagination__item--active"),
		).toBe(true);
		expect(links[3].getAttribute("aria-disabled")).toBe("true");
		pagination.destroy();
	});

	it("moves to the previous page and keeps the first-page boundary disabled", () => {
		document.body.innerHTML = `<nav class="pagination"><ul class="pagination__list">
				<li class="pagination__item"><a class="pagination__link pagination__link--prev" href="#prev">Previous</a></li>
				<li class="pagination__item"><a class="pagination__link" href="#1">1</a></li>
				<li class="pagination__item pagination__item--active"><a class="pagination__link" href="#2" aria-current="page">2</a></li>
				<li class="pagination__item"><a class="pagination__link pagination__link--next" href="#next">Next</a></li>
			</ul></nav>`;
		const root = document.querySelector(".pagination");
		const [prev, page1, page2] = root.querySelectorAll(".pagination__link");
		const pagination = new Pagination(root);

		prev.click();
		expect(page1.getAttribute("aria-current")).toBe("page");
		expect(page2.hasAttribute("aria-current")).toBe(false);
		expect(prev.getAttribute("aria-disabled")).toBe("true");
		root.querySelector(".pagination__link--next").click();
		expect(page2.getAttribute("aria-current")).toBe("page");
		pagination.destroy();
	});
});
