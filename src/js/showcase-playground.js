const controls = document.querySelector("#playground-controls");
const componentInput = controls?.querySelector("#playground-component");
const variantInput = controls?.querySelector("#playground-variant");
const sizeInput = controls?.querySelector("#playground-size");
const stateInput = controls?.querySelector("#playground-state");
const stateField = controls?.querySelector("#playground-state-field");
const componentName = controls?.querySelector("#playground-component-name");
const componentIndex = controls?.querySelector("#playground-component-index");
const sample = document.querySelector("#playground-sample");
const stateLabel = document.querySelector("#playground-state-label");
const codeOutput = document.querySelector("#playground-code");
const copyButton = document.querySelector("#playground-copy");
const copyStatus = document.querySelector("#playground-copy-status");
const codeTabs = Array.from(document.querySelectorAll("[data-code-tab]"));

const componentMeta = {
	button: {
		name: "Button",
		index: "01",
		label: "Enregistrer",
		states: true,
		colors: [
			"primary",
			"secondary",
			"success",
			"warning",
			"danger",
			"info",
			"primary-outline",
			"soft-blue",
		],
	},
	badge: {
		name: "Badge",
		index: "02",
		label: "En cours",
		states: false,
		colors: ["primary", "secondary", "success", "warning", "danger", "info"],
	},
	alert: {
		name: "Alert",
		index: "03",
		label: "Modifications enregistrées.",
		states: false,
		colors: ["primary", "secondary", "success", "warning", "danger", "info"],
	},
};
const semanticColors = new Set([
	"primary",
	"secondary",
	"success",
	"warning",
	"danger",
	"info",
]);
const semanticColorDefaults = {
	primary: "#0068ff",
	secondary: "#2f322a",
	success: "#22b934",
	warning: "#f0ad4e",
	danger: "#ba2123",
	info: "#5abfdd",
};
const accentDefaults = { blue: { soft: "#ebf0ff", high: "#4e7aff" } };

if (
	controls &&
	componentInput &&
	variantInput &&
	sizeInput &&
	stateInput &&
	sample &&
	stateLabel &&
	codeOutput &&
	copyButton &&
	copyStatus
) {
	let codeLanguage = "html";

	function createPreview(meta, variant, size, state) {
		const root = document.createElement(
			meta.name === "Alert" ? "div" : meta.name === "Badge" ? "span" : "button",
		);
		root.className = `${meta.name === "Button" ? "btn" : meta.name.toLowerCase()} ${meta.name === "Button" ? `btn--${variant}` : `${meta.name.toLowerCase()}--${variant}`} ${meta.name === "Button" ? `btn--${size}` : `${meta.name.toLowerCase()}--${size}`}`;
		if (meta.name === "Button") {
			root.type = "button";
			const label = document.createElement("span");
			label.className = "btn__label";
			label.textContent = meta.label;
			root.append(label);
			if (state === "disabled") root.disabled = true;
			if (state === "loading") {
				root.classList.add("btn--loading");
				root.setAttribute("aria-busy", "true");
				root.setAttribute("aria-label", "Chargement");
				const spinner = document.createElement("span");
				spinner.className = "btn__spinner";
				spinner.setAttribute("aria-hidden", "true");
				root.append(spinner);
			}
			if (state === "hover") root.classList.add("is-preview-hover");
			if (state === "active") root.classList.add("is-preview-active");
			const [variantBase, variantStyle] = variant.split("-");
			if (semanticColors.has(variantBase)) {
				const interaction =
					variantStyle === "outline"
						? `var(--color-${variantBase})`
						: `var(--color-${variantBase}-${state === "active" ? "active" : "hover"})`;
				root.style.setProperty("--playground-interaction-color", interaction);
				root.style.setProperty(
					"--playground-foreground",
					`var(--color-on-${variantBase})`,
				);
			} else if (variantBase === "soft" || variantBase === "high") {
				const accent = variantStyle;
				const interactionVariant = variantBase === "soft" ? "high" : "soft";
				const foregroundVariant =
					interactionVariant === "soft" ? "high" : "soft";
				root.style.setProperty(
					"--playground-interaction-color",
					`var(--accent-${accent}-${interactionVariant})`,
				);
				root.style.setProperty(
					"--playground-foreground",
					`var(--accent-${accent}-${foregroundVariant})`,
				);
			}
		} else {
			root.textContent = meta.label;
		}
		return root;
	}

	function render() {
		const key = componentInput.value;
		const meta = componentMeta[key];
		const variant = variantInput.value;
		const size = sizeInput.value;
		const state = meta.states ? stateInput.value : "normal";
		componentName.textContent = meta.name;
		componentIndex.textContent = meta.index;
		stateField.hidden = !meta.states;

		const node = createPreview(meta, variant, size, state);
		sample.replaceChildren(node);
		stateLabel.textContent = `${meta.name} · ${variantInput.selectedOptions[0].textContent} · ${size.toUpperCase()}${meta.states ? ` · ${stateInput.selectedOptions[0].textContent}` : ""}`;

		const className = node.className
			.split(" ")
			.filter((name) => !name.startsWith("is-preview-"))
			.join(" ");
		const attrs = [
			`class="${className}"`,
			node.disabled ? "disabled" : "",
			node.getAttribute("aria-busy")
				? 'aria-busy="true" aria-label="Chargement"'
				: "",
		]
			.filter(Boolean)
			.join(" ");
		const content =
			meta.name === "Button"
				? `<span class="btn__label">${meta.label}</span>${state === "loading" ? '<span class="btn__spinner" aria-hidden="true"></span>' : ""}`
				: meta.label;
		const html = `<${node.localName} ${attrs}${node.localName === "button" ? ' type="button"' : ""}>${content}</${node.localName}>`;
		const sass = `// Configure Sass once in your app entry
${getSassSetup(variant)}

// Reuse the generated class in your markup:
// ${className}`;
		codeOutput.textContent = codeLanguage === "html" ? html : sass;
	}

	function getSassSetup(variant) {
		const [base, modifier] = variant.split("-");
		if (semanticColors.has(base)) {
			return `@use "myui" with (
  $color-${base}: ${semanticColorDefaults[base]}
);`;
		}
		if (base === "soft" || base === "high") {
			const accent = accentDefaults[modifier];
			if (!accent) return '@use "myui";';
			return `@use "myui";

:root {
  --accent-${modifier}-soft: ${accent.soft};
  --accent-${modifier}-high: ${accent.high};
}`;
		}
		return '@use "myui";';
	}

	function setVariantOptions() {
		const options = componentMeta[componentInput.value].colors;
		const previous = variantInput.value;
		variantInput.replaceChildren(
			...options.map((variant) => {
				const option = document.createElement("option");
				option.value = variant;
				option.textContent = variant
					.replaceAll("-", " ")
					.replace(/\b\w/g, (letter) => letter.toUpperCase());
				return option;
			}),
		);
		variantInput.value = options.includes(previous) ? previous : options[0];
	}

	componentInput.addEventListener("change", () => {
		setVariantOptions();
		render();
	});
	controls.addEventListener("submit", (event) => event.preventDefault());
	controls.addEventListener("change", render);
	function selectCodeTab(tab, focus = false) {
		codeLanguage = tab.dataset.codeTab;
		codeOutput.setAttribute("aria-labelledby", tab.id);
		for (const item of codeTabs) {
			const selected = item === tab;
			item.setAttribute("aria-selected", String(selected));
			item.tabIndex = selected ? 0 : -1;
		}
		if (focus) tab.focus();
		render();
	}
	for (const tab of codeTabs) {
		tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
		tab.addEventListener("click", () => selectCodeTab(tab));
		tab.addEventListener("keydown", (event) => {
			if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
				return;
			event.preventDefault();
			const current = codeTabs.indexOf(tab);
			const next =
				event.key === "Home"
					? 0
					: event.key === "End"
						? codeTabs.length - 1
						: (current +
								(event.key === "ArrowRight" ? 1 : -1) +
								codeTabs.length) %
							codeTabs.length;
			selectCodeTab(codeTabs[next], true);
		});
	}
	copyButton.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(codeOutput.textContent);
			copyStatus.textContent = "Code copié dans le presse-papiers.";
			copyButton.textContent = "Copié";
		} catch {
			copyStatus.textContent =
				"La copie n’est pas disponible dans ce contexte.";
		}
	});
	setVariantOptions();
	render();
}
