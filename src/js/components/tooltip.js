import Component from "../Component.js";

/**
 * Tooltip Component
 *
 * @example
 * new Tooltip('#help', {
 *   message: 'Additional information',
 *   position: 'top',
 *   size: 'sm',
 *   color: 'primary',
 * });
 */
export default class Tooltip extends Component {
	static defaults = {
		color: null,
		message: "",
		position: "top",
		size: null,
	};

	static VALID_POSITIONS = ["top", "right", "bottom", "left"];

	init() {
		if (!Tooltip.VALID_POSITIONS.includes(this.options.position)) {
			console.warn(
				`[Tooltip] Invalid position "${this.options.position}", using "top".`,
			);
			this.options.position = "top";
		}

		this._tooltipEl = null;

		this._showHandler = () => this.show();
		this._hideHandler = () => this.hide();

		this.on("mouseenter", this._showHandler);
		this.on("mouseleave", this._hideHandler);
		this.on("focus", this._showHandler);
		this.on("blur", this._hideHandler);
	}

	show() {
		this.hide();

		const { color, message, position, size } = this.options;
		const tooltip = document.createElement("div");
		tooltip.className = [
			"tooltip",
			`tooltip--${position}`,
			size && `tooltip--${size}`,
			color && `tooltip--${color}`,
		]
			.filter(Boolean)
			.join(" ");
		tooltip.textContent = message;
		tooltip.setAttribute("role", "tooltip");

		document.body.appendChild(tooltip);
		this._tooltipEl = tooltip;

		const triggerRect = this.el.getBoundingClientRect();
		const tooltipRect = tooltip.getBoundingClientRect();
		const gap = 10;
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;

		let left = 0;
		let top = 0;

		switch (position) {
			case "top":
				left =
					scrollX +
					triggerRect.left +
					(triggerRect.width - tooltipRect.width) / 2;
				top = scrollY + triggerRect.top - tooltipRect.height - gap;
				break;
			case "right":
				left = scrollX + triggerRect.right + gap;
				top =
					scrollY +
					triggerRect.top +
					(triggerRect.height - tooltipRect.height) / 2;
				break;
			case "bottom":
				left =
					scrollX +
					triggerRect.left +
					(triggerRect.width - tooltipRect.width) / 2;
				top = scrollY + triggerRect.bottom + gap;
				break;
			case "left":
				left = scrollX + triggerRect.left - tooltipRect.width - gap;
				top =
					scrollY +
					triggerRect.top +
					(triggerRect.height - tooltipRect.height) / 2;
				break;
		}

		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${top}px`;

		this.emit("tooltip:show");
	}

	hide() {
		if (this._tooltipEl) {
			this._tooltipEl.remove();
			this._tooltipEl = null;
			this.emit("tooltip:hide");
		}
	}

	destroy() {
		this.hide();
		super.destroy();
	}
}
