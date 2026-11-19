import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { test } from "vitest";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

test("loader color variants preserve the visible gap and rotating animation", () => {
	const css = sass.compileString('@use "src/scss";', {
		loadPaths: [projectRoot],
	}).css;

	const base = css.match(/\.loader\s*\{([^}]*)\}/)?.[1];
	assert.ok(base);
	assert.match(base, /--loader-color:\s*var\(--color-primary\)/);
	assert.match(base, /border:\s*3px solid var\(--loader-color\)/);
	assert.match(base, /border-bottom-color:\s*transparent/);
	assert.match(base, /animation:\s*loader-rotation 1\.5s linear infinite/);
	assert.match(css, /@keyframes loader-rotation\s*\{[^}]*rotate\(0deg\)/);

	for (const color of [
		"primary",
		"secondary",
		"success",
		"warning",
		"danger",
		"info",
	]) {
		assert.match(
			css,
			new RegExp(
				`\\.loader--${color}\\s*\\{\\s*--loader-color:\\s*var\\(--color-${color}\\);\\s*\\}`,
			),
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
		assert.match(
			css,
			new RegExp(
				`\\.loader--${accent}\\s*\\{\\s*--loader-color:\\s*var\\(--accent-${accent}-high\\);\\s*\\}`,
			),
		);
	}
});

test("button spinners keep a visible gap and an infinite rotation", () => {
	const css = sass.compileString('@use "src/scss";', {
		loadPaths: [projectRoot],
	}).css;
	const spinner = css.match(/\.btn__spinner::after\s*\{([^}]*)\}/)?.[1];
	assert.ok(spinner);
	assert.match(spinner, /border-right-color:\s*transparent/);
	assert.match(spinner, /animation:\s*btn-spin 0\.75s linear infinite/);
	assert.match(css, /@keyframes btn-spin\s*\{[^}]*rotate\(360deg\)/);
});
