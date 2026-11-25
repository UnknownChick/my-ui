import assert from "node:assert/strict";
import Dropzone from "myui/vendor/dropzone";
import $ from "myui/vendor/jquery";
import attachSelect2 from "myui/vendor/select2";
import { afterEach, test } from "vitest";

Dropzone.autoDiscover = false;

afterEach(() => {
	document.body.innerHTML = "";
});

test("vendor exports can initialize Select2 and Dropzone", () => {
	attachSelect2(window, $);
	document.body.innerHTML = `
		<select id="test-select"><option value="one">One</option></select>
		<form id="test-dropzone" class="dropzone" action="/upload"></form>
	`;

	$("#test-select").select2();
	assert.ok(document.querySelector(".select2-container"));

	const dropzone = new Dropzone("#test-dropzone", { autoProcessQueue: false });
	assert.ok(dropzone instanceof Dropzone);
	dropzone.destroy();
	$("#test-select").select2("destroy");
});
