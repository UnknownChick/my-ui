import Component from "../Component.js";

export default class Dropdown extends Component {
	static defaults = {};

	init() {
		this._toggle = this.$(".dropdown__toggle");
		this._content = this.$(".dropdown__content");
		this._isOpen = false;

		if (!this._toggle || !this._content) {
			console.warn(
				"[Dropdown] Missing .dropdown__toggle or .dropdown__content:",
				this.el,
			);
			return;
		}

		this.on("click", this._toggle, () => this.toggle());

		this._outsideHandler = (e) => {
			if (!this.el.contains(e.target)) this.close();
		};
		document.addEventListener("click", this._outsideHandler);
	}

	toggle() {
		this._isOpen ? this.close() : this.open();
	}

	open() {
		this._isOpen = true;
		this.addClass("dropdown--open");
		this.emit("dropdown:open");
	}

	close() {
		this._isOpen = false;
		this.removeClass("dropdown--open");
		this.emit("dropdown:close");
	}

	destroy() {
		document.removeEventListener("click", this._outsideHandler);
		super.destroy();
	}
}
