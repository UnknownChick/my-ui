import Component from "../Component.js";

/**
 * Sidebar Component
 *
 * Collapsible menu sidebar with an icon rail mode and animated submenus.
 * Toggle the rail with `.sidebar__toggle`; toggle a branch with
 * `.sidebar__link--toggle` and its `.sidebar__submenu`.
 *
 * @example
 * const sidebar = new Sidebar("#app-sidebar", { collapsed: true });
 * sidebar.toggle();
 */
export default class Sidebar extends Component {
	static defaults = {
		collapsed: false,
		accordion: false,
		storageKey: null,
	};

	init() {
		this._isCollapsed = false;
		this._titleLinks = new Set();
		this._toggle = this.$(".sidebar__toggle");
		this._items = this.$$(".sidebar__item").filter(
			(item) => this._getTrigger(item) && this._getSubmenu(item),
		);

		for (const item of this._items) {
			const trigger = this._getTrigger(item);
			const submenu = this._getSubmenu(item);

			if (!submenu.id) {
				submenu.id = `myui-sidebar-submenu-${Sidebar._nextId++}`;
			}
			trigger.setAttribute("aria-controls", submenu.id);
			if (!trigger.hasAttribute("aria-expanded")) {
				trigger.setAttribute("aria-expanded", "false");
			}

			const open =
				item.classList.contains("sidebar__item--open") ||
				trigger.getAttribute("aria-expanded") === "true";
			this._setSubmenu(item, open);
			this.on("click", trigger, () => this.toggleSubmenu(item));
		}

		// Keep the branch containing the current page open.
		for (const item of this._items) {
			const hasCurrentPage = item.querySelector(
				'.sidebar__link--active, .sidebar__submenu-link--active, [aria-current="page"]',
			);
			if (hasCurrentPage) this._setSubmenu(item, true);
		}

		if (this._toggle) {
			this.on("click", this._toggle, () => this.toggle());
		}

		let collapsed = Boolean(this.options.collapsed);
		if (this.options.storageKey) {
			try {
				const stored = globalThis.localStorage?.getItem(
					this.options.storageKey,
				);
				if (stored !== null && stored !== undefined) {
					collapsed = stored === "true";
				}
			} catch {
				// Storage can be unavailable in private or sandboxed contexts.
			}
		}

		this._applyCollapsed(collapsed);
	}

	toggle() {
		this._isCollapsed ? this.expand() : this.collapse();
	}

	collapse() {
		if (this._isCollapsed) return;
		this._applyCollapsed(true);
		this.emit("sidebar:collapse");
	}

	expand() {
		if (!this._isCollapsed) return;
		this._applyCollapsed(false);
		this.emit("sidebar:expand");
	}

	toggleSubmenu(item) {
		if (!this._items.includes(item)) return;

		// A collapsed rail cannot show a branch: reveal the labels first.
		if (this._isCollapsed) this.expand();

		const open = !item.classList.contains("sidebar__item--open");
		if (open && this.options.accordion) {
			for (const other of this._items) {
				if (other !== item) this._setSubmenu(other, false);
			}
		}

		this._setSubmenu(item, open);
		this.emit("sidebar:submenu-toggle", { item, open });
	}

	_setSubmenu(item, open) {
		const trigger = this._getTrigger(item);
		const submenu = this._getSubmenu(item);
		if (!trigger || !submenu) return;

		item.classList.toggle("sidebar__item--open", open);
		trigger.setAttribute("aria-expanded", String(open));
		submenu.toggleAttribute("inert", !open);
	}

	_getTrigger(item) {
		return item.querySelector(
			".sidebar__link--toggle, .sidebar__link[aria-expanded]",
		);
	}

	_getSubmenu(item) {
		return item.querySelector(".sidebar__submenu");
	}

	_closeAllSubmenus() {
		for (const item of this._items) {
			if (item.classList.contains("sidebar__item--open")) {
				this._setSubmenu(item, false);
			}
		}
	}

	_applyCollapsed(collapsed) {
		if (collapsed) this._closeAllSubmenus();

		this._isCollapsed = collapsed;
		this.toggleClass("sidebar--collapsed", collapsed);

		if (this._toggle) {
			this._toggle.setAttribute("aria-expanded", String(!collapsed));
		}

		this._syncLinkTitles();
		this._persistCollapsed();
	}

	_syncLinkTitles() {
		for (const link of this.$$(".sidebar__link")) {
			const label = link.querySelector(".sidebar__label");
			if (!label) continue;

			if (this._isCollapsed) {
				if (!link.hasAttribute("title")) {
					link.setAttribute("title", label.textContent.trim());
					this._titleLinks.add(link);
				}
			} else if (this._titleLinks.has(link)) {
				link.removeAttribute("title");
				this._titleLinks.delete(link);
			}
		}
	}

	_persistCollapsed() {
		if (!this.options.storageKey) return;

		try {
			globalThis.localStorage?.setItem(
				this.options.storageKey,
				String(this._isCollapsed),
			);
		} catch {
			// Persisting is optional; ignore unavailable storage.
		}
	}

	destroy() {
		for (const link of this._titleLinks) link.removeAttribute("title");
		this._titleLinks.clear();
		super.destroy();
	}
}

Sidebar._nextId = 1;
