import Component from "../Component.js";

/**
 * Modal Component — uses the native <dialog> element.
 *
 * @example
 * const modal = new Modal('#myModal', {
 *   animation: 'scale',
 *   closeOnBackdropClick: true,
 *   onOpen: (el) => console.log('opened'),
 * });
 */
export default class Modal extends Component {
	static defaults = {
		animation: "fade",
		animationDuration: 300,
		closeOnBackdropClick: true,
		closeOnEscape: true,
		lockScroll: true,
		trapFocus: true,
		restoreFocus: true,
		autoFocus: true,
		autoCloseOnFooterClick: true,
		onOpen: null,
		onClose: null,
		onBeforeOpen: null,
		onBeforeClose: null,
	};

	static activeModals = [];
	static _scrollLock = null;
	static _scrollLockOwners = new Set();

	init() {
		this._isOpen = false;
		this._triggerElement = null;
		this._closeTimer = null;

		this._setupTriggers();
		this._setupCloseButtons();
		this._setupModalEvents();
		this._setupKeyboard();
	}

	// ── Setup ────────────────────────────────────────────

	_setupTriggers() {
		if (!this.el.id) return;
		document
			.querySelectorAll(`[data-modal-target="${this.el.id}"]`)
			.forEach((trigger) => {
				trigger.setAttribute("aria-controls", this.el.id);
				trigger.setAttribute("aria-haspopup", "dialog");
				trigger.setAttribute("aria-expanded", "false");
				this.on("click", trigger, (e) => {
					e.preventDefault();
					this.open(e.currentTarget);
				});
			});
	}

	_setupCloseButtons() {
		// Generic .modal__close within this modal
		const closeBtn = this.$(".modal__close");
		if (closeBtn) {
			this.on("click", closeBtn, (e) => {
				e.preventDefault();
				this.close();
			});
		}
		// data-modal-close buttons
		this.$$(`[data-modal-close="${this.el.id}"]`).forEach((btn) => {
			this.on("click", btn, (e) => {
				e.preventDefault();
				this.close();
			});
		});
	}

	_setupModalEvents() {
		// Backdrop click
		if (this.options.closeOnBackdropClick) {
			this.on("click", (e) => {
				if (e.target === this.el) this.close();
			});
		}

		// Native cancel event
		this.on("cancel", (e) => {
			e.preventDefault();
			if (this.options.closeOnEscape) this.close();
		});

		// Footer auto-close
		if (this.options.autoCloseOnFooterClick) {
			const footer = this.$(".modal__footer");
			if (footer) {
				this.on("click", footer, (e) => {
					const button = e.target.closest("button");
					if (button && !button.hasAttribute("data-modal-prevent-close"))
						this.close();
				});
			}
		}

		// Animation end cleanup
		this.on("animationend", () => {
			if (!this._isOpen) {
				this.el.classList.remove(`modal--${this.options.animation}-out`);
			}
		});
	}

	_setupKeyboard() {
		this._keydownHandler = (e) => {
			if (!this._isOpen || Modal.activeModals.at(-1) !== this) return;
			if (e.key === "Escape" && this.options.closeOnEscape) this.close();
			if (e.key === "Tab" && this.options.trapFocus) this._handleFocusTrap(e);
		};
		this.on("keydown", document, this._keydownHandler);
	}

	// ── Open / Close ─────────────────────────────────────

	open(triggerElement = null) {
		if (this._isOpen) {
			if (this._closeTimer) {
				clearTimeout(this._closeTimer);
				this._closeTimer = null;
				this.el.classList.remove(`modal--${this.options.animation}-out`);
				if (!Component.prefersReducedMotion()) {
					this.el.classList.add(`modal--${this.options.animation}-in`);
				}
			}
			return;
		}
		if (this.options.onBeforeOpen?.(this.el) === false) return;
		clearTimeout(this._closeTimer);
		this._closeTimer = null;
		this.el.classList.remove(`modal--${this.options.animation}-out`);

		this._triggerElement = triggerElement || document.activeElement;
		this.el.showModal();
		this._isOpen = true;
		this._setTriggerExpanded(true);
		Modal.activeModals.push(this);

		if (this.options.lockScroll) this._lockScroll();

		if (this.options.animation && !Component.prefersReducedMotion()) {
			this.el.classList.add(`modal--${this.options.animation}-in`);
		}

		if (this.options.autoFocus) this._focusFirst();

		this.options.onOpen?.(this.el);
		this.emit("modal:open");
	}

	close() {
		if (!this._isOpen || this._closeTimer) return;
		if (this.options.onBeforeClose?.(this.el) === false) return;
		if (Component.prefersReducedMotion() || !this.options.animation) {
			this.el.classList.remove(`modal--${this.options.animation}-in`);
			this.el.classList.remove(`modal--${this.options.animation}-out`);
			this._finalizeClose();
			return;
		}

		if (this.options.animation) {
			this.el.classList.remove(`modal--${this.options.animation}-in`);
			this.el.classList.add(`modal--${this.options.animation}-out`);
			clearTimeout(this._closeTimer);
			this._closeTimer = setTimeout(
				() => this._finalizeClose(),
				this.options.animationDuration,
			);
		} else {
			this._finalizeClose();
		}
	}

	_finalizeClose() {
		if (!this._isOpen) return;
		clearTimeout(this._closeTimer);
		this._closeTimer = null;
		this.el.close();
		this._isOpen = false;
		this._setTriggerExpanded(false);

		const idx = Modal.activeModals.indexOf(this);
		if (idx > -1) Modal.activeModals.splice(idx, 1);

		if (this.options.lockScroll) this._unlockScroll();
		if (this.options.restoreFocus && this._triggerElement)
			this._triggerElement.focus();

		this.options.onClose?.(this.el);
		this.emit("modal:close");
	}

	_setTriggerExpanded(expanded) {
		if (!this.el.id) return;
		document
			.querySelectorAll(`[data-modal-target="${this.el.id}"]`)
			.forEach((trigger) => {
				trigger.setAttribute("aria-expanded", String(expanded));
			});
	}

	toggle(trigger = null) {
		this._isOpen ? this.close() : this.open(trigger);
	}

	// ── Scroll Lock ──────────────────────────────────────

	_lockScroll() {
		if (Modal._scrollLockOwners.has(this)) return;
		if (Modal._scrollLockOwners.size === 0) {
			const w = window.innerWidth - document.documentElement.clientWidth;
			Modal._scrollLock = {
				overflow: document.body.style.overflow,
				paddingRight: document.body.style.paddingRight,
			};
			document.body.style.overflow = "hidden";
			document.body.style.paddingRight = `${w}px`;
			document.body.setAttribute("data-modal-scroll-locked", "true");
		}
		Modal._scrollLockOwners.add(this);
	}

	_unlockScroll() {
		Modal._scrollLockOwners.delete(this);
		if (Modal._scrollLockOwners.size > 0 || !Modal._scrollLock) return;
		document.body.style.overflow = Modal._scrollLock.overflow;
		document.body.style.paddingRight = Modal._scrollLock.paddingRight;
		Modal._scrollLock = null;
		document.body.removeAttribute("data-modal-scroll-locked");
	}

	// ── Focus ────────────────────────────────────────────

	_getFocusable() {
		return this.$$(
			'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
		);
	}

	_focusFirst() {
		const els = this._getFocusable();
		if (els.length) {
			const delay = Component.prefersReducedMotion() ? 0 : 50;
			setTimeout(() => els[0].focus(), delay);
		}
	}

	_handleFocusTrap(e) {
		const els = this._getFocusable();
		if (!els.length) return;
		const first = els[0];
		const last = els.at(-1);

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last?.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first?.focus();
		}
	}

	// ── Cleanup ──────────────────────────────────────────

	destroy() {
		clearTimeout(this._closeTimer);
		this._closeTimer = null;
		if (this._isOpen) this._finalizeClose();
		super.destroy();
	}
}
