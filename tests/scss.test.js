import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { test } from "vitest";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

function compile(source) {
	return sass.compileString(source, {
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		quietDeps: true,
	}).css;
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

test("semantic and accent custom properties drive component styles at runtime", () => {
	const css = compile('@use "src/scss";');
	assert.match(css, /--tooltip-background:\s*var\(--color-primary\)/);
	assert.match(css, /--accent-blue-soft:\s*#ebf0ff/);
	assert.match(css, /background-color:\s*var\(--accent-blue-soft\)/);
	assert.match(css, /background-color:\s*var\(--color-primary\)/);
	assert.match(css, /--font-size-md:\s*1rem/);
	assert.match(css, /.btn--md\s*\{[^}]*font-size:\s*var\(--font-size-md\)/);
	assert.match(css, /.p-4\s*\{[^}]*padding:\s*var\(--spacing-4\)/);
	assert.match(css, /.fs-md\s*\{[^}]*font-size:\s*var\(--fs-fluid-md\)/);
	assert.match(css, /--color-primary-hover:/);
	assert.match(css, /--color-primary-active:\s*color-mix/);
	assert.match(css, /--color-success-hover:\s*color-mix/);
	assert.match(css, /--color-white-active:\s*color-mix/);
	assert.match(css, /white 25%/);
	assert.match(
		css,
		/color-mix\(\s*in srgb,\s*var\(--color-primary\),\s*black 20%\s*\)/,
	);
	assert.match(css, /[data-theme=dark][^{]*\{[^}]*--shadow:/);
	assert.match(css, /\.avatar--image\s*\{/);
	assert.match(css, /\.table__cell--select\s*\{/);
	assert.doesNotMatch(css, /:has\(/);
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
	assert.doesNotMatch(css, /:has\(/);

	assert.match(css, /\.flex\s*\{/);
	assert.match(css, /\.grid-cols-3\s*\{/);
	assert.match(css, /\.p-4\s*\{/);
	assert.match(css, /\.text-primary\s*\{/);
	assert.match(css, /\.ratio--16x9\s*\{/);
	assert.doesNotMatch(css, /\.opacity-10\s*\{/);
	assert.doesNotMatch(css, /\.row\s*\{/);
	assert.doesNotMatch(css, /\.prose\s*\{/);
});

test("the full bundle includes advanced utilities and vendor integrations", () => {
	const css = compile('@use "src/scss/full" with ($color-primary: #5b4ce2);');

	for (const selector of [
		/\.row\s*\{/,
		/\.col-md-6\s*\{/,
		/\.relative\s*\{/,
		/\.opacity-50\s*\{/,
		/\.prose\s*\{/,
		/\.dropzone\s*\{/,
		/\.select2-container\s*\{/,
		/\.toast\s*\{/,
	]) {
		assert.match(css, selector);
	}
	assert.match(css, /--color-primary:\s*#5b4ce2;/);
});

test("row gaps do not override the standard gap utilities", () => {
	const css = compile('@use "src/scss/full";');

	assert.match(css, /\.gap-4\s*\{[^}]*gap:\s*var\(--spacing-4\)/);
	assert.match(
		css,
		/\.row\.gap-4\s*\{[^}]*gap:\s*4rem;[^}]*--gap-size:\s*4rem/,
	);
	assert.match(
		css,
		/\.row\.gap-8\s*\{[^}]*gap:\s*var\(--spacing-8\);[^}]*--gap-size:\s*var\(--spacing-8\)/,
	);
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
