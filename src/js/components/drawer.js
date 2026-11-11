import Component from "../Component.js";

/**
 * Drawer Component
 *
 * Slide-in panel from left or right edge.
 * Trigger via data-drawer-target="drawerId" or programmatically.
 *
 * @example
 * const drawer = new Drawer('#myDrawer', { position: 'left' });
 * drawer.open();
 */
export default class Drawer extends Component {
	static defaults = {
		position: "left",
	};

	static VALID_POSITIONS = ["left", "right"];

	init() {
		if (!Drawer.VALID_POSITIONS.includes(this.options.position)) {
			console.warn(
				`[Drawer] Invalid position "${this.options.position}", using "left".`,
			);
			this.options.position = "left";
		}

		this.addClass(`drawer--${this.options.position}`);
		this._isOpen = false;

		// Backdrop
		this._backdrop = document.createElement("div");
		this._backdrop.className = "drawer__backdrop";
		this._backdrop.setAttribute("aria-hidden", "true");
		this.el.insertAdjacentElement("afterend", this._backdrop);
		this.el.setAttribute("aria-hidden", "true");
		this.el.inert = true;
		this.el.setAttribute("role", "dialog");
		this.el.setAttribute("aria-modal", "true");
		if (!this.el.hasAttribute("tabindex"))
			this.el.setAttribute("tabindex", "-1");

		// Close button
		const closeBtn = this.$(".drawer__close");
		if (closeBtn) {
			this.on("click", closeBtn, () => this.close());
		}

		// Backdrop click
		this.on("click", this._backdrop, () => this.close());

		// External triggers
		if (this.el.id) {
			document
				.querySelectorAll(`[data-drawer-target="${this.el.id}"]`)
				.forEach((trigger) => {
					trigger.setAttribute("aria-controls", this.el.id);
					trigger.setAttribute("aria-expanded", "false");
					this.on("click", trigger, (e) => {
						this._triggerElement = e.currentTarget;
						this.toggle();
					});
				});
		}

		// Escape key
		this._escHandler = (e) => {
			if (!this._isOpen) return;
			if (e.key === "Escape") {
				e.preventDefault();
				this.close();
			} else if (e.key === "Tab") {
				this._trapFocus(e);
			}
		};
		this.on("keydown", document, this._escHandler);
	}

	open() {
		if (this._isOpen) return;
		const active = document.activeElement;
		if (!this._triggerElement && active && !this.el.contains(active)) {
			this._triggerElement = active;
		}
		this._isOpen = true;
		this._setTriggerExpanded(true);
		this.addClass("drawer--open");
		this._backdrop.classList.add("drawer__backdrop--visible");
		this.el.setAttribute("aria-hidden", "false");
		this.el.inert = false;
		this._backdrop.setAttribute("aria-hidden", "false");
		(this._getFocusable()[0] || this.el).focus();
		this.emit("drawer:open");
	}

	close() {
		if (!this._isOpen) return;
		this._isOpen = false;
		this._setTriggerExpanded(false);
		this.removeClass("drawer--open");
		this._backdrop.classList.remove("drawer__backdrop--visible");
		this.el.setAttribute("aria-hidden", "true");
		this.el.inert = true;
		this._backdrop.setAttribute("aria-hidden", "true");
		this._triggerElement?.focus();
		this._triggerElement = null;
		this.emit("drawer:close");
	}

	_setTriggerExpanded(expanded) {
		if (!this.el.id) return;
		document
			.querySelectorAll(`[data-drawer-target="${this.el.id}"]`)
			.forEach((trigger) => {
				trigger.setAttribute("aria-expanded", String(expanded));
			});
	}

	_getFocusable() {
		return Array.from(
			this.el.querySelectorAll(
				'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
			),
		).filter((element) => !element.hasAttribute("hidden"));
	}

	_trapFocus(e) {
		const elements = this._getFocusable();
		if (!elements.length) {
			e.preventDefault();
			this.el.focus();
			return;
		}
		const first = elements[0];
		const last = elements.at(-1);
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	toggle() {
		this._isOpen ? this.close() : this.open();
	}

	destroy() {
		if (this._isOpen) this.close();
		this._backdrop?.remove();
		super.destroy();
	}
}
