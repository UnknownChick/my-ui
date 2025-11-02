/**
 * Tabs Component - Accessible and flexible tab management
 *
 * @example
 * new Tabs('.tabs', {
 *   saveSelection: true,
 *   defaultTab: 0,
 *   enableKeyboard: true,
 *   animation: 'fade',
 *   onChange: (tabId, panel) => console.log('Tab changed:', tabId)
 * });
 */
export default class Tabs {
	/**
	 * Default component options
	 */
	static DEFAULT_OPTIONS = {
		saveSelection: false,      // Save selection in URL (hash)
		defaultTab: 0,             // Default active tab index (0-based)
		enableKeyboard: true,      // Enable keyboard navigation (arrows)
		animation: null,           // Transition animation: 'fade', 'slide', or null
		animationDuration: 300,    // Animation duration in ms
		autoActivate: true,        // Automatically activate tab on keyboard focus
		onChange: null,            // Callback: (tabId, panelElement, groupData) => {}
		onInit: null,              // Callback: (groupData) => {}
		lazy: false,               // Load panel content on demand
		destroyOnHide: false       // Destroy content of inactive panels
	};

	/**
	 * CSS selectors for elements
	 */
	static SELECTORS = {
		nav: '.tabs__nav',
		content: '.tabs__content',
		button: '.tabs__nav__button',
		panel: '.tabs__panel'
	};

	constructor(selector, options = {}) {
		this.options = { ...Tabs.DEFAULT_OPTIONS, ...options };
		this.tabGroups = [];
		this.hashChangeHandler = null;

		this._initializeElements(selector);
		this._setupEventListeners();
		this._initializeDefaultStates();
	}

	/**
	 * Initialize DOM elements
	 */
	_initializeElements(selector) {
		const tabElements = this._getElements(selector);

		if (!tabElements.length) {
			console.warn('[Tabs] No elements found for selector:', selector);
			return;
		}

		tabElements.forEach(element => { this._initializeGroup(element); });
	}

	/**
	 * Get elements from selector
	 */
	_getElements(selector) {
		if (typeof selector === 'string') {
			return Array.from(document.querySelectorAll(selector));
		}
		if (selector instanceof Element) {
			return [selector];
		}
		if (selector instanceof NodeList || Array.isArray(selector)) {
			return Array.from(selector);
		}
		return [];
	}

	/**
	 * Initialize a tab group
	 */
	_initializeGroup(element) {
		const nav = element.querySelector(Tabs.SELECTORS.nav);
		const content = element.querySelector(Tabs.SELECTORS.content);

		if (!this._validateStructure(element, nav, content)) {
			return;
		}

		const buttons = Array.from(nav.querySelectorAll(Tabs.SELECTORS.button));
		const panels = Array.from(content.querySelectorAll(Tabs.SELECTORS.panel));

		if (!this._validateButtons(buttons, panels)) {
			return;
		}

		const groupData = {
			element,
			nav,
			content,
			buttons,
			panels,
			id: element.id || this._generateGroupId(),
			activeIndex: -1,
			activatedByHash: false
		};

		this.tabGroups.push(groupData);
		this._setupGroupEvents(groupData);

		if (this.options.onInit) {
			this.options.onInit(groupData);
		}
	}

	/**
	 * Validate the HTML structure of the group
	 */
	_validateStructure(element, nav, content) {
		if (!nav || !content) {
			console.warn('[Tabs] Invalid structure - missing nav or content elements:', element);
			return false;
		}
		return true;
	}

	/**
	 * Validate buttons and panels
	 */
	_validateButtons(buttons, panels) {
		if (buttons.length === 0 || panels.length === 0) {
			console.warn('[Tabs] No buttons or panels found');
			return false;
		}

		buttons.forEach(btn => {
			if (!btn.id) {
				console.warn('[Tabs] Button without ID detected - recommended for accessibility:', btn);
			}
		});

		return true;
	}

	/**
	 * Generate a unique ID for the group
	 */
	_generateGroupId() {
		return `tabs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Set up events for a group
	 */
	_setupGroupEvents(groupData) {
		// Click on buttons
		groupData.nav.addEventListener('click', (e) => {
			const button = e.target.closest(Tabs.SELECTORS.button);
			if (button) {
				const index = groupData.buttons.indexOf(button);
				this.activateTab(index, groupData, true);
			}
		});

		// Keyboard navigation
		if (this.options.enableKeyboard) {
			groupData.nav.addEventListener('keydown', (e) => this._handleKeyboard(e, groupData));
		}
	}

	/**
	 * Handle keyboard navigation
	 */
	_handleKeyboard(e, groupData) {
		const { buttons } = groupData;
		const currentIndex = buttons.findIndex(btn => btn === document.activeElement);

		if (currentIndex === -1) return;

		let newIndex = currentIndex;

		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				e.preventDefault();
				newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				e.preventDefault();
				newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'Home':
				e.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				newIndex = buttons.length - 1;
				break;
			default:
				return;
		}

		buttons[newIndex].focus();

		if (this.options.autoActivate) {
			this.activateTab(newIndex, groupData, false);
		}
	}

	/**
	 * Set up global event listeners
	 */
	_setupEventListeners() {
		if (this.options.saveSelection && this.tabGroups.length > 0) {
			this.hashChangeHandler = () => this._handleHashChange(true);
			window.addEventListener('hashchange', this.hashChangeHandler);
		}
	}

	/**
	 * Initialize default states
	 */
	_initializeDefaultStates() {
		if (this.tabGroups.length === 0) return;

		if (this.options.saveSelection) {
			this._handleHashChange(false);
		} else {
			this.tabGroups.forEach(group => { this._activateDefault(group); });
		}
	}

	/**
	 * Activate the default tab for a group
	 */
	_activateDefault(groupData) {
		const preSelected = groupData.buttons.findIndex(btn =>
			btn.getAttribute('aria-selected') === 'true'
		);

		const defaultIndex = preSelected !== -1 ? preSelected : this.options.defaultTab;
		this.activateTab(defaultIndex, groupData, false);
	}

	/**
	 * Activate a tab
	 * @param {number|HTMLElement|string} tab - Index, button element, or button ID
	 * @param {Object} groupData - Group data (optional if only one group)
	 * @param {boolean} setFocus - Set focus on the activated tab
	 */
	activateTab(tab, groupData = null, setFocus = true) {
		// If only one group and groupData not specified
		if (!groupData && this.tabGroups.length === 1) {
			groupData = this.tabGroups[0];
		}

		if (!groupData) {
			console.warn('[Tabs] Group not specified and multiple groups available');
			return;
		}

		const index = this._resolveTabIndex(tab, groupData);

		if (index === -1 || index >= groupData.buttons.length) {
			console.warn('[Tabs] Invalid tab index:', tab);
			return;
		}

		const button = groupData.buttons[index];
		const panelId = button.getAttribute('aria-controls');
		const panel = groupData.panels.find(p => p.id === panelId);

		if (!panel) {
			console.warn('[Tabs] Panel not found for:', button);
			return;
		}

		this._deactivateAll(groupData);
		this._activateButton(button, setFocus);
		this._activatePanel(panel, groupData);

		groupData.activeIndex = index;

		this._updateHash(button, groupData);
		this._triggerCallback(button.id, panel, groupData);
	}

	/**
	 * Resolve tab index from different input types
	 */
	_resolveTabIndex(tab, groupData) {
		if (typeof tab === 'number') {
			return tab;
		}
		if (tab instanceof HTMLElement) {
			return groupData.buttons.indexOf(tab);
		}
		if (typeof tab === 'string') {
			return groupData.buttons.findIndex(btn => btn.id === tab);
		}
		return -1;
	}

	/**
	 * Deactivate all buttons and panels
	 */
	_deactivateAll(groupData) {
		groupData.buttons.forEach(btn => {
			btn.setAttribute('aria-selected', 'false');
			btn.tabIndex = -1;
		});

		groupData.panels.forEach(panel => {
			panel.setAttribute('hidden', '');
			if (this.options.animation) {
				panel.classList.remove(`tabs__panel--${this.options.animation}-in`);
			}
			if (this.options.destroyOnHide && panel.dataset.tabsContent) {
				panel.innerHTML = '';
			}
		});
	}

	/**
	 * Activate a button
	 */
	_activateButton(button, setFocus) {
		button.setAttribute('aria-selected', 'true');
		button.tabIndex = 0;
		if (setFocus) {
			button.focus();
		}
	}

	/**
	 * Activate a panel with optional animation
	 */
	_activatePanel(panel, _groupData) {
		panel.removeAttribute('hidden');

		if (this.options.lazy && panel.dataset.tabsSrc && !panel.dataset.tabsLoaded) {
			this._loadPanelContent(panel);
		}

		if (this.options.animation) {
			requestAnimationFrame(() => {
				panel.classList.add(`tabs__panel--${this.options.animation}-in`);
			});
		}
	}

	/**
	 * Load panel content with lazy loading
	 */
	async _loadPanelContent(panel) {
		try {
			const response = await fetch(panel.dataset.tabsSrc);
			const content = await response.text();
			panel.innerHTML = content;
			panel.dataset.tabsLoaded = 'true';
		} catch (error) {
			console.error('[Tabs] Error loading content:', error);
			panel.innerHTML = '<p>Error loading content.</p>';
		}
	}

	/**
	 * Update the URL hash
	 */
	_updateHash(button, groupData) {
		if (!this.options.saveSelection || !button.id) return;

		const hashValue = groupData.element.id
			? `${groupData.element.id}-${button.id}`
			: button.id;

		if (window.location.hash !== `#${hashValue}`) {
			history.replaceState(null, '', `#${hashValue}`);
		}
	}

	/**
	 * Trigger the onChange callback
	 */
	_triggerCallback(tabId, panel, groupData) {
		if (this.options.onChange) {
			this.options.onChange(tabId, panel, groupData);
		}
	}

	/**
	 * Handle hash changes
	 */
	_handleHashChange(setFocus) {
		const hash = window.location.hash.substring(1);

		this.tabGroups.forEach(group => {
			group.activatedByHash = false;
		});

		if (hash) {
			for (const group of this.tabGroups) {
				const index = group.buttons.findIndex(btn => {
					if (!btn.id) return false;
					const expectedHash = group.element.id
						? `${group.element.id}-${btn.id}`
						: btn.id;
					return hash === expectedHash;
				});

				if (index !== -1) {
					this.activateTab(index, group, setFocus);
					group.activatedByHash = true;
					break;
				}
			}
		}

		// Activate default tab for groups not activated by hash
		this.tabGroups.forEach(group => {
			if (!group.activatedByHash) {
				this._activateDefault(group);
			}
		});
	}

	/**
	 * Activate the next tab in a group
	 */
	next(groupData = this.tabGroups[0]) {
		const nextIndex = (groupData.activeIndex + 1) % groupData.buttons.length;
		this.activateTab(nextIndex, groupData);
	}

	/**
	 * Activate the previous tab in a group
	 */
	prev(groupData = this.tabGroups[0]) {
		const prevIndex = groupData.activeIndex === 0
			? groupData.buttons.length - 1
			: groupData.activeIndex - 1;
		this.activateTab(prevIndex, groupData);
	}

	/**
	 * Destroy the instance and clean up event listeners
	 */
	destroy() {
		if (this.hashChangeHandler) {
			window.removeEventListener('hashchange', this.hashChangeHandler);
		}

		this.tabGroups = [];
		this.hashChangeHandler = null;
	}
}
