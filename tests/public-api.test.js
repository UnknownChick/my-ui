import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import * as sass from "sass";
import Component from "../src/js/Component.js";

class Probe extends Component {}

class FakeElement {
	constructor(dataset = {}) {
		this.dataset = dataset;
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
}

globalThis.document = { querySelector: () => null };

test("components have explicit construction and getOrCreate semantics", () => {
	const element = new FakeElement({ probeEnabled: "false", probeCount: "3" });
	const probe = new Probe(element, { count: 4 });
	assert.equal(probe.options.enabled, false);
	assert.equal(probe.options.count, 4);
	assert.equal(Probe.getInstance(element), probe);
	assert.equal(Probe.getOrCreate(element), probe);
	assert.throws(() => new Probe(element), /instance already exists/);
	probe.destroy();
	assert.equal(Probe.getInstance(element), undefined);
	assert.doesNotThrow(() => new Probe(element).destroy());
});

test("autoInit includes a matching root and reuses an existing instance", () => {
	const child = new FakeElement();
	const root = new FakeElement();
	root.matches = (selector) => selector === ".probe";
	root.querySelectorAll = () => [child];
	const instances = Probe.autoInit(".probe", {}, root);
	assert.equal(instances.length, 2);
	assert.equal(instances[0], Probe.getInstance(root));
	assert.equal(instances[1], Probe.getInstance(child));
	assert.equal(Probe.autoInit(".probe", {}, root)[0], instances[0]);
	for (const instance of instances) instance.destroy();
});

test("package self-reference exposes the supported JavaScript API", async () => {
	const api = await import("myui");
	assert.equal(typeof api.initMyUI, "function");
	assert.equal(typeof api.Dropdown.getOrCreate, "function");
	assert.equal(typeof api.initIcons, "function");
});

test("published JavaScript API and Sass package import resolve for consumers", async () => {
	const metadata = JSON.parse(
		await readFile(path.join(process.cwd(), "package.json"), "utf8"),
	);
	assert.equal(metadata.exports["."].import, "./src/js/index.js");
	assert.equal(metadata.exports["."].sass, "./src/scss/index.scss");
	const consumer = await mkdtemp(path.join(os.tmpdir(), "myui-consumer-"));
	try {
		const modules = path.join(consumer, "node_modules");
		await mkdir(modules);
		await symlink(process.cwd(), path.join(modules, "myui"), "dir");
		const css = sass.compileString('@use "pkg:myui";', {
			url: pathToFileURL(path.join(consumer, "consumer.scss")),
			importers: [new sass.NodePackageImporter(consumer)],
		}).css;
		assert.match(css, /--color-primary:/);
	} finally {
		await rm(consumer, { recursive: true, force: true });
	}
});
