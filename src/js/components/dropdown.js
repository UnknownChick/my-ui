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
		if (!this._content.id)
			this._content.id = `myui-dropdown-${Dropdown._nextId++}`;
		this._toggle.setAttribute("aria-controls", this._content.id);
		this._toggle.setAttribute("aria-expanded", "false");
		if (!this._toggle.hasAttribute("aria-haspopup")) {
			this._toggle.setAttribute("aria-haspopup", "true");
		}

		this.on("click", this._toggle, () => this.toggle());
		this.on("keydown", this._toggle, (e) => {
			if (["ArrowDown", "Enter", " "].includes(e.key)) {
				e.preventDefault();
				this.open(true);
			} else if (e.key === "Escape" && this._isOpen) {
				e.preventDefault();
				this.close(true);
			}
		});
		this.on("keydown", this._content, (e) => this._onMenuKeydown(e));
		this.on("click", document, (e) => {
			if (!this.el.contains(e.target)) this.close();
		});
	}

	toggle() {
		this._isOpen ? this.close() : this.open();
	}

	open(focusFirst = false) {
		if (this._isOpen) return;
		this._isOpen = true;
		this.addClass("dropdown--open");
		this._toggle.setAttribute("aria-expanded", "true");
		if (focusFirst) this._getMenuItems()[0]?.focus();
		this.emit("dropdown:open");
	}

	close(restoreFocus = false) {
		if (!this._isOpen) return;
		this._isOpen = false;
		this.removeClass("dropdown--open");
		this._toggle.setAttribute("aria-expanded", "false");
		if (restoreFocus) this._toggle.focus();
		this.emit("dropdown:close");
	}

	_getMenuItems() {
		return Array.from(
			this._content.querySelectorAll(
				'a[href], button:not(:disabled), [role="menuitem"]',
			),
		).filter((item) => !item.hasAttribute("disabled"));
	}

	_onMenuKeydown(e) {
		const items = this._getMenuItems();
		if (e.key === "Escape") {
			e.preventDefault();
			this.close(true);
			return;
		}
		if (!items.length) return;
		const index = items.indexOf(document.activeElement);
		let next = index;
		if (e.key === "ArrowDown") next = (index + 1 + items.length) % items.length;
		else if (e.key === "ArrowUp")
			next = (index - 1 + items.length) % items.length;
		else if (e.key === "Home") next = 0;
		else if (e.key === "End") next = items.length - 1;
		else return;
		e.preventDefault();
		items[next]?.focus();
	}

	destroy() {
		super.destroy();
	}
}

Dropdown._nextId = 1;
