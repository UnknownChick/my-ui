import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

function compile(source) {
	return sass.compileString(source, { loadPaths: [projectRoot] }).css;
}

test("custom brand colors generate theme tokens and readable foregrounds", () => {
	const css = compile(`
		@use "src/scss" with (
			$color-primary: #5b4ce2,
			$color-secondary: #334155
		);
	`);

	assert.match(css, /--color-primary:\s*#5b4ce2;/);
	assert.match(css, /--color-on-primary:\s*white;/);
	assert.match(css, /--color-secondary:\s*#334155;/);
	assert.match(css, /\[data-theme=white\]/);
	assert.match(css, /\[data-theme=dark\]/);
});

test("contrast helpers use WCAG relative luminance", () => {
	const css = compile(`
		@use "src/scss" as myui;

		.test {
			--black-on-white: #{myui.contrast-ratio(#000, #fff)};
			--on-yellow: #{myui.contrast-color(#ffeb3b)};
			--on-brand: #{myui.contrast-color(#5b4ce2)};
			--yellow-ratio: #{myui.contrast-ratio(
				myui.contrast-color(#ffeb3b),
				#ffeb3b
			)};
		}
	`);

	assert.match(css, /--black-on-white:\s*21;/);
	assert.match(css, /--on-yellow:\s*black;/);
	assert.match(css, /--on-brand:\s*white;/);
	const yellowRatio = Number(css.match(/--yellow-ratio:\s*([\d.]+)/)?.[1]);
	assert.ok(
		yellowRatio >= 4.5,
		`Expected WCAG AA contrast, got ${yellowRatio}`,
	);
});

test("form styles are opt-in through the form wrapper", () => {
	const css = compile('@use "src/scss";');

	assert.match(css, /\.form input:not/);
	assert.match(css, /\.form textarea:not/);
	assert.doesNotMatch(css, /(^|\n)\s+input:not\(\[type="button"\]/);
});

test("the default bundle keeps core utilities and omits advanced families", () => {
	const css = compile('@use "src/scss";');

	assert.match(css, /\.flex\s*\{/);
	assert.match(css, /\.grid-cols-3\s*\{/);
	assert.match(css, /\.p-4\s*\{/);
	assert.match(css, /\.text-primary\s*\{/);
	assert.match(css, /\.ratio--16x9\s*\{/);
	assert.doesNotMatch(css, /\.opacity-10\s*\{/);
	assert.doesNotMatch(css, /\.row\s*\{/);
	assert.doesNotMatch(css, /\.prose\s*\{/);
});

test("dropdown size variants set the content width", () => {
	const css = compile('@use "src/scss";');

	assert.match(css, /\.dropdown--xs\s*\{[^}]*--dropdown-width:\s*12rem;/);
	assert.match(css, /\.dropdown--xxl\s*\{[^}]*--dropdown-width:\s*30rem;/);
	assert.match(css, /\.dropdown\s*\{[^}]*width:\s*fit-content;/);
	assert.match(
		css,
		/\.dropdown__content\s*\{[^}]*width:\s*var\(--dropdown-width\);/,
	);
});

test("utilities can be disabled from the consuming Sass entry point", () => {
	const css = compile('@use "src/scss" with ($enable-utilities: false);');

	assert.doesNotMatch(css, /\.flex\s*\{/);
	assert.doesNotMatch(css, /\.grid\s*\{/);
	assert.doesNotMatch(css, /\.text-primary\s*\{/);
	assert.doesNotMatch(css, /\.ratio--16x9\s*\{/);
});
