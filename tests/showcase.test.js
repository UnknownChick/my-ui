import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

test("button showcase displays every variant and a disabled state", async () => {
	const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
	const buttonSection = html
		.split('<section class="card showcase__section" id="button"')[1]
		.split('<section class="card showcase__section" id="card"')[0];

	assert.ok(buttonSection);
	assert.doesNotMatch(buttonSection, /<details\b/);
	assert.match(buttonSection, /\bdisabled\b/);

	for (const color of [
		"primary",
		"secondary",
		"success",
		"warning",
		"danger",
		"info",
		"white",
		"black",
	]) {
		assert.ok(
			buttonSection.includes(`btn--${color}`),
			`Missing ${color} button`,
		);
		assert.ok(
			buttonSection.includes(`btn--${color}-outline`),
			`Missing ${color} outline button`,
		);
	}

	for (const accent of [
		"red",
		"orange",
		"blue",
		"green",
		"purple",
		"grey",
		"brown",
		"cyan",
		"black",
	]) {
		assert.ok(
			buttonSection.includes(`btn--soft-${accent}`),
			`Missing soft ${accent} button`,
		);
		assert.ok(
			buttonSection.includes(`btn--high-${accent}`),
			`Missing high ${accent} button`,
		);
	}
});

test("badge and square showcases display every configured soft and high accent", async () => {
	const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
	const badgeSection = html
		.split('<section class="card showcase__section" id="badge"')[1]
		.split('<section class="card showcase__section" id="breadcrumb"')[0];
	const squareSection = html
		.split('<section class="card showcase__section" id="square"')[1]
		.split('<section class="card showcase__section" id="table"')[0];

	assert.ok(badgeSection);
	assert.ok(squareSection);
	assert.match(badgeSection, /<details[^>]*\bopen\b/);

	for (const accent of [
		"red",
		"orange",
		"blue",
		"green",
		"purple",
		"grey",
		"brown",
		"cyan",
		"black",
	]) {
		assert.ok(badgeSection.includes(`badge--soft-${accent}`));
		assert.ok(badgeSection.includes(`badge--high-${accent}`));
		assert.ok(squareSection.includes(`square--soft-${accent}`));
		assert.ok(squareSection.includes(`square--high-${accent}`));
	}
});
