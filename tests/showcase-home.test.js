import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test, vi } from "vitest";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

async function readShowcase() {
	const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
	return new DOMParser().parseFromString(html, "text/html");
}

afterEach(() => {
	document.body.innerHTML = "";
	vi.resetModules();
});

test("the homepage introduces components and links every preview and index entry to an example", async () => {
	const page = await readShowcase();
	const collection = page.querySelector("#collection");
	const playground = page.querySelector("#playground");
	const catalog = page.querySelector("#components");

	assert.equal(page.querySelectorAll("h1").length, 1);
	assert.ok(collection && playground && catalog);
	assert.ok(
		collection.compareDocumentPosition(playground) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	);
	assert.ok(
		playground.compareDocumentPosition(catalog) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	);
	assert.equal(collection.querySelectorAll(".component-tile").length, 12);
	assert.equal(
		collection.querySelectorAll(".component-index__links a").length,
		29,
	);
	assert.equal(
		page.querySelector(".showcase__skip").getAttribute("href"),
		"#collection",
	);
	for (const section of page.querySelectorAll(".showcase__section")) {
		assert.equal(section.closest("#components"), catalog);
	}
	assert.ok(page.querySelector("main .showcase__footer"));
	for (const progress of page.querySelectorAll("#progress progress")) {
		assert.ok(progress.classList.contains("progress"));
	}

	for (const link of collection.querySelectorAll(
		".component-tile, .component-index__links a",
	)) {
		const target = link.getAttribute("href");
		assert.ok(target?.startsWith("#"));
		assert.ok(page.getElementById(target.slice(1)), `Missing target ${target}`);
	}

	for (const tile of collection.querySelectorAll(".component-tile")) {
		assert.ok(
			tile.querySelector(".component-tile__preview[aria-hidden='true']"),
		);
		assert.equal(
			tile.querySelector("a, button, input, select, textarea"),
			null,
		);
	}
});

test("playground keeps its visible state label when the preview updates", async () => {
	const page = await readShowcase();
	document.body.innerHTML = page.body.innerHTML;
	await import("../src/js/showcase-playground.js");

	const state = document.querySelector("#playground-state");
	const label = document.querySelector("#playground-state-label");
	state.value = "loading";
	state.dispatchEvent(new Event("change", { bubbles: true }));

	assert.ok(label.isConnected);
	assert.match(label.textContent, /Chargement/);
	assert.ok(document.querySelector("#playground-sample .btn__spinner"));
});
