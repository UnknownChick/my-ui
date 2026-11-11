import assert from "node:assert/strict";
import { test } from "node:test";

class Target {
	listeners = new Map();
	addEventListener(type, fn) {
		this.listeners.set(type, fn);
	}
	removeEventListener(type) {
		this.listeners.delete(type);
	}
	dispatchEvent(event) {
		this.listeners.get(event.type)?.(event);
	}
}
class Classes {
	add() {}
	remove() {}
}
class Element extends Target {
	attrs = new Map();
	classList = new Classes();
	id = "";
	setAttribute(key, value) {
		this.attrs.set(key, String(value));
	}
	getAttribute(key) {
		return this.attrs.get(key) ?? null;
	}
	hasAttribute(key) {
		return this.attrs.has(key);
	}
	removeAttribute(key) {
		this.attrs.delete(key);
	}
	focus() {
		document.activeElement = this;
	}
}
globalThis.document = new Target();
document.activeElement = null;
globalThis.CustomEvent = class {
	constructor(type, options = {}) {
		this.type = type;
		this.detail = options.detail;
	}
};
const { default: Tabs } = await import("../src/js/components/tabs.js");

test("tabs establish ARIA relationships and support keyboard activation", () => {
	const nav = new Element();
	const tabA = new Element();
	const tabB = new Element();
	const panelA = new Element();
	const panelB = new Element();
	const root = new Element();
	root.querySelector = (selector) => (selector === ".tabs__nav" ? nav : {});
	root.querySelectorAll = (selector) =>
		selector === ".tabs__button"
			? [tabA, tabB]
			: selector === ".tabs__panel"
				? [panelA, panelB]
				: [];
	const tabs = new Tabs(root, { autoActivate: false });
	assert.equal(nav.getAttribute("role"), "tablist");
	assert.equal(tabA.getAttribute("aria-controls"), panelA.id);
	assert.equal(panelA.getAttribute("aria-labelledby"), tabA.id);
	assert.equal(panelB.hasAttribute("hidden"), true);

	document.activeElement = tabA;
	nav.dispatchEvent({
		type: "keydown",
		key: "ArrowRight",
		preventDefault() {},
	});
	assert.equal(document.activeElement, tabB);
	assert.equal(tabB.getAttribute("aria-selected"), "false");
	nav.dispatchEvent({ type: "keydown", key: "Enter", preventDefault() {} });
	assert.equal(tabB.getAttribute("aria-selected"), "true");
	assert.equal(panelA.hasAttribute("hidden"), true);
	assert.equal(panelB.hasAttribute("hidden"), false);
	tabs.destroy();
});
