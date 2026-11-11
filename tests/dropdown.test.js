import assert from "node:assert/strict";
import { test } from "node:test";

class FakeEventTarget {
	constructor() {
		this.listeners = new Map();
	}

	addEventListener(type, listener) {
		const listeners = this.listeners.get(type) ?? new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	dispatchEvent(event) {
		event.target ??= this;
		event.currentTarget = this;
		for (const listener of this.listeners.get(event.type) ?? []) {
			listener.call(this, event);
		}
		return true;
	}

	trigger(type, event) {
		for (const listener of this.listeners.get(type) ?? []) {
			listener.call(this, event);
		}
	}

	listenerCount(type) {
		return this.listeners.get(type)?.size ?? 0;
	}
}

class FakeClassList {
	classes = new Set();

	add(name) {
		this.classes.add(name);
	}

	remove(name) {
		this.classes.delete(name);
	}

	contains(name) {
		return this.classes.has(name);
	}

	toggle(name, force = !this.contains(name)) {
		if (force) this.add(name);
		else this.remove(name);
		return force;
	}
}

class FakeElement extends FakeEventTarget {
	attributes = new Map();
	id = "";
	focus() {
		document.activeElement = this;
	}
	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}
	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}
	hasAttribute(name) {
		return this.attributes.has(name);
	}
	removeAttribute(name) {
		this.attributes.delete(name);
	}
	constructor(children = {}) {
		super();
		this.children = children;
		this.dataset = {};
		this.classList = new FakeClassList();
	}

	matches(selector) {
		return selector === ".dropdown" && this.isDropdown;
	}

	querySelector(selector) {
		return this.children[selector] ?? null;
	}

	querySelectorAll() {
		return this.items ?? [];
	}

	contains(target) {
		return (
			target === this ||
			Object.values(this.children).some(
				(child) => child === target || child.contains?.(target),
			)
		);
	}
}

class FakeCustomEvent {
	constructor(type, { detail = null, bubbles = false } = {}) {
		this.type = type;
		this.detail = detail;
		this.bubbles = bubbles;
		this.target = null;
		this.currentTarget = null;
		this.defaultPrevented = false;
	}
	preventDefault() {
		this.defaultPrevented = true;
	}
}

globalThis.CustomEvent = FakeCustomEvent;
globalThis.document = new FakeEventTarget();
document.activeElement = null;

const { default: Dropdown } = await import("../src/js/components/dropdown.js");

test("dropdown opens, closes on outside click, emits events, and cleans up", () => {
	const toggle = new FakeElement();
	const content = new FakeElement();
	const root = new FakeElement({
		".dropdown__toggle": toggle,
		".dropdown__content": content,
	});
	root.isDropdown = true;
	const outside = new FakeElement();
	const events = [];

	root.addEventListener("dropdown:open", (event) => events.push(event.type));
	root.addEventListener("dropdown:close", (event) => events.push(event.type));

	const dropdown = new Dropdown(root);
	assert.throws(() => new Dropdown(root), /instance already exists/);
	assert.equal(Dropdown.getOrCreate(root), dropdown);
	assert.equal(
		Dropdown.autoInit(
			".dropdown",
			{},
			{ matches: () => false, querySelectorAll: () => [root] },
		)[0],
		dropdown,
	);

	toggle.dispatchEvent(new FakeCustomEvent("click"));
	assert.equal(root.classList.contains("dropdown--open"), true);
	assert.equal(toggle.getAttribute("aria-expanded"), "true");
	assert.equal(toggle.getAttribute("aria-controls"), content.id);
	assert.deepEqual(events, ["dropdown:open"]);

	document.trigger("click", { target: outside });
	assert.equal(root.classList.contains("dropdown--open"), false);
	assert.equal(toggle.getAttribute("aria-expanded"), "false");
	assert.deepEqual(events, ["dropdown:open", "dropdown:close"]);

	dropdown.destroy();
	assert.equal(Dropdown.getInstance(root), undefined);
	assert.equal(toggle.listenerCount("click"), 0);
	assert.equal(document.listenerCount("click"), 0);
});

test("dropdown keyboard controls update focus and restore it on Escape", () => {
	const first = new FakeElement();
	const second = new FakeElement();
	const toggle = new FakeElement();
	const content = new FakeElement();
	content.items = [first, second];
	const root = new FakeElement({
		".dropdown__toggle": toggle,
		".dropdown__content": content,
	});
	const dropdown = new Dropdown(root);

	const open = new FakeCustomEvent("keydown");
	open.key = "ArrowDown";
	toggle.dispatchEvent(open);
	assert.equal(document.activeElement, first);
	assert.equal(toggle.getAttribute("aria-expanded"), "true");

	const advance = new FakeCustomEvent("keydown");
	advance.key = "ArrowDown";
	content.dispatchEvent(advance);
	assert.equal(document.activeElement, second);

	const escapeKey = new FakeCustomEvent("keydown");
	escapeKey.key = "Escape";
	content.dispatchEvent(escapeKey);
	assert.equal(document.activeElement, toggle);
	assert.equal(toggle.getAttribute("aria-expanded"), "false");
	dropdown.destroy();
});
