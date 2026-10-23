/**
 * Component Base Class
 *
 * Abstract base for all My UI interactive components.
 * Handles element selection, option merging, event management, state tracking, and lifecycle hooks.
 *
 * @example
 * class MyComponent extends Component {
 *   static defaults = { animation: 'fade' };
 *   init() { this.on('click', this.el, () => this.toggle()); }
 *   destroy() { this.off(); }
 * }
 */
export default class Component {
	/** Override in subclasses to provide default options */
	static defaults = {};

	/** Store instances keyed by element for getInstance() */
	static _instances = new WeakMap();

	/**
	 * @param {string|Element} selector - CSS selector or DOM element
	 * @param {Object} options - Instance options (merged with defaults)
	 */
	constructor(selector, options = {}) {
		this.el =
			typeof selector === "string"
				? document.querySelector(selector)
				: selector;

		if (!this.el) {
			console.warn(`[${this.constructor.name}] Element not found:`, selector);
			return;
		}

		this.options = {
			...this.constructor.defaults,
			...this._parseDataAttrs(),
			...options,
		};

		this._listeners = [];
		this._state = {};

		// Store instance on element
		this.constructor._instances.set(this.el, this);

		this.init();
	}

	// ── Lifecycle ────────────────────────────────────────

	/** Override in subclasses to set up the component */
	init() {}

	/** Override in subclasses to tear down the component */
	destroy() {
		this.off();
		this.constructor._instances.delete(this.el);
	}

	// ── DOM Helpers ──────────────────────────────────────

	/** Query a single element within this component */
	$(selector) {
		return this.el.querySelector(selector);
	}

	/** Query all elements within this component */
	$$(selector) {
		return Array.from(this.el.querySelectorAll(selector));
	}

	/** Add a CSS class to the root element */
	addClass(cls) {
		this.el.classList.add(cls);
	}

	/** Remove a CSS class from the root element */
	removeClass(cls) {
		this.el.classList.remove(cls);
	}

	/** Toggle a CSS class on the root element */
	toggleClass(cls, force) {
		this.el.classList.toggle(cls, force);
	}

	// ── Event Management ─────────────────────────────────

	/**
	 * Attach an event listener and track it for cleanup.
	 * @param {string} event - Event name
	 * @param {Element|string} target - Element or CSS selector (scoped to this.el)
	 * @param {Function} handler - Event handler
	 * @param {Object} [opts] - addEventListener options
	 */
	on(event, target, handler, opts) {
		let el;
		if (typeof target === "string") {
			el = this.el.querySelector(target);
		} else if (typeof target === "function") {
			// on(event, handler) shorthand — attach to this.el
			opts = handler;
			handler = target;
			el = this.el;
		} else {
			el = target;
		}

		if (!el) return;

		el.addEventListener(event, handler, opts);
		this._listeners.push({ event, el, handler, opts });
	}

	/**
	 * Remove tracked event listeners.
	 * Call with no args to remove all, or pass event/target to filter.
	 */
	off(event, target) {
		this._listeners = this._listeners.filter((l) => {
			const matchEvent = !event || l.event === event;
			const matchTarget = !target || l.el === target;

			if (matchEvent && matchTarget) {
				l.el.removeEventListener(l.event, l.handler, l.opts);
				return false;
			}
			return true;
		});
	}

	/**
	 * Dispatch a custom event on the root element.
	 * @param {string} name - Event name (prefixed with component name)
	 * @param {*} detail - Event detail data
	 */
	emit(name, detail = null) {
		this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
	}

	// ── State Management ─────────────────────────────────

	/**
	 * Update internal state and call onStateChange if defined.
	 * @param {Object} newState - Partial state to merge
	 */
	setState(newState) {
		const prev = { ...this._state };
		Object.assign(this._state, newState);
		if (typeof this.onStateChange === "function") {
			this.onStateChange(this._state, prev);
		}
	}

	/** Get current state */
	get state() {
		return { ...this._state };
	}

	// ── Data Attribute Parsing ───────────────────────────

	/**
	 * Parse data-* attributes from the element into an options object.
	 * Converts data-option-name="value" → { optionName: value }
	 */
	_parseDataAttrs() {
		if (!this.el) return {};

		const data = {};
		const prefix = this.constructor.name.toLowerCase();

		for (const [key, value] of Object.entries(this.el.dataset)) {
			// Only parse attributes matching the component prefix
			if (key.startsWith(prefix)) {
				const optionKey = key.slice(prefix.length);
				const camelKey = optionKey.charAt(0).toLowerCase() + optionKey.slice(1);
				data[camelKey] = this._castValue(value);
			}
		}

		return data;
	}

	/**
	 * Cast string values to appropriate types
	 */
	_castValue(value) {
		if (value === "true") return true;
		if (value === "false") return false;
		if (value === "null") return null;
		if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
		return value;
	}

	// ── Static Helpers ───────────────────────────────────

	/**
	 * Get the component instance attached to a given element.
	 * @param {Element} el
	 * @returns {Component|undefined}
	 */
	static getInstance(el) {
		// biome-ignore lint/complexity/noThisInStatic: polymorphic — subclasses have their own _instances WeakMap
		return this._instances.get(el);
	}

	/**
	 * Auto-initialize components for all elements matching a selector.
	 * @param {string} selector - CSS selector
	 * @param {Object} options - Options passed to each instance
	 * @returns {Component[]} Array of created instances
	 */
	static autoInit(selector, options = {}) {
		return Array.from(document.querySelectorAll(selector)).map(
			(el) => new this(el, options),
		);
	}
}
