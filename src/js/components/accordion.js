import Component from "../Component.js";

/**
 * Accordion Component
 *
 * Uses the native <details> element with smooth open/close animations.
 * Supports grouped accordions (via [name] attribute) so only one opens at a time.
 *
 * @example
 * Accordion.autoInit('.accordion');
 */
export default class Accordion extends Component {
	static defaults = {
		duration: 400,
		easing: "ease-out",
	};

	init() {
		this._summary = this.$(".accordion__title");
		this._content = this.$(".accordion__content");
		this._animation = null;
		this._isClosing = false;
		this._isExpanding = false;

		if (this._summary) {
			this.on("click", this._summary, (e) => this._onClick(e));
		}
	}

	_onClick(e) {
		e.preventDefault();
		this.el.style.overflow = "hidden";

		if (this._isClosing || !this.el.open) {
			this.open();
		} else if (this._isExpanding || this.el.open) {
			this.close();
		}
	}

	close() {
		this._isClosing = true;
		const startHeight = `${this.el.offsetHeight}px`;
		const endHeight = `${this._summary.offsetHeight}px`;

		this._animation?.cancel();

		this._animation = this.el.animate(
			{ height: [startHeight, endHeight] },
			{ duration: this.options.duration, easing: this.options.easing },
		);
		this._animation.onfinish = () => this._onFinish(false);
		this._animation.oncancel = () => {
			this._isClosing = false;
		};

		this.emit("accordion:close");
	}

	open() {
		// Close siblings in the same group
		const groupName = this.el.getAttribute("name");
		if (groupName) {
			document
				.querySelectorAll(`details.accordion[name="${groupName}"]`)
				.forEach((el) => {
					if (el !== this.el && el.open) {
						Accordion.getInstance(el)?.close();
					}
				});
		}

		this.el.style.height = `${this.el.offsetHeight}px`;
		this.el.open = true;
		requestAnimationFrame(() => this._expand());

		this.emit("accordion:open");
	}

	_expand() {
		this._isExpanding = true;
		const startHeight = `${this.el.offsetHeight}px`;
		const endHeight = `${this._summary.offsetHeight + this._content.offsetHeight}px`;

		this._animation?.cancel();

		this._animation = this.el.animate(
			{ height: [startHeight, endHeight] },
			{ duration: this.options.duration, easing: this.options.easing },
		);
		this._animation.onfinish = () => this._onFinish(true);
		this._animation.oncancel = () => {
			this._isExpanding = false;
		};
	}

	_onFinish(open) {
		this.el.open = open;
		this._animation = null;
		this._isClosing = false;
		this._isExpanding = false;
		this.el.style.height = "";
		this.el.style.overflow = "";
	}

	destroy() {
		this._animation?.cancel();
		super.destroy();
	}
}
