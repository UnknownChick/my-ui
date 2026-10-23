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

	dispatchEvent(event) {
		event.target = this;
		for (const listener of this.listeners.get(event.type) ?? []) {
			listener.call(this, event);
		}
		return true;
	}
}

class FakeCustomEvent {
	constructor(type, { detail = null } = {}) {
		this.type = type;
		this.detail = detail;
		this.target = null;
	}
}

const mediaQuery = new FakeEventTarget();
mediaQuery.matches = false;

const root = {
	attributes: new Map(),
	style: {},
	setAttribute(name, value) {
		this.attributes.set(name, value);
	},
	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	},
};

const toggleButton = new FakeEventTarget();
const documentEvents = [];
const document = new FakeEventTarget();
document.readyState = "complete";
document.documentElement = root;
document.querySelectorAll = () => [toggleButton];
document.dispatchEvent = (event) => {
	documentEvents.push(event);
	return true;
};

const storage = new Map();

globalThis.CustomEvent = FakeCustomEvent;
globalThis.document = document;
globalThis.localStorage = {
	getItem(key) {
		return storage.get(key) ?? null;
	},
	setItem(key, value) {
		storage.set(key, value);
	},
	removeItem(key) {
		storage.delete(key);
	},
};
globalThis.window = { matchMedia: () => mediaQuery };

const { ThemeToggle } = await import("../src/js/features/theme-toggle.js");

test("theme toggle persists user choices and follows system preference on reset", () => {
	assert.equal(ThemeToggle.current, "light");
	assert.equal(root.style.colorScheme, "light");

	toggleButton.dispatchEvent(new FakeCustomEvent("click"));
	assert.equal(ThemeToggle.current, "dark");
	assert.equal(storage.get("myui-theme"), "dark");
	assert.equal(root.style.colorScheme, "dark");

	ThemeToggle.set("light");
	assert.equal(ThemeToggle.current, "light");
	assert.deepEqual(documentEvents.at(-1).detail, { theme: "light" });

	ThemeToggle.set("sepia");
	assert.equal(ThemeToggle.current, "light");
	assert.equal(storage.get("myui-theme"), "light");

	mediaQuery.matches = true;
	ThemeToggle.reset();
	assert.equal(ThemeToggle.current, "dark");
	assert.equal(storage.has("myui-theme"), false);

	mediaQuery.matches = false;
	const preferenceChange = new FakeCustomEvent("change");
	preferenceChange.matches = false;
	mediaQuery.dispatchEvent(preferenceChange);
	assert.equal(ThemeToggle.current, "light");
});
