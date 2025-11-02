/**
 * Modal Component - Accessible and flexible modal management
 *
 * @example
 * new Modal('#myModal', {
 *   animation: 'fade',
 *   closeOnBackdropClick: true,
 *   closeOnEscape: true,
 *   lockScroll: true,
 *   onOpen: (element) => console.log('Modal opened'),
 *   onClose: (element) => console.log('Modal closed')
 * });
 */
export default class Modal {
	/**
	 * Default component options
	 */
	static DEFAULT_OPTIONS = {
		animation: 'fade',           // Animation type: 'fade', 'scale', 'slide-up', 'slide-down', or null
		animationDuration: 300,      // Animation duration in ms
		closeOnBackdropClick: true,  // Close modal when clicking backdrop
		closeOnEscape: true,         // Close modal on ESC key
		lockScroll: true,            // Lock body scroll when modal is open
		trapFocus: true,             // Trap focus within modal
		restoreFocus: true,          // Restore focus to trigger element on close
		autoFocus: true,             // Auto focus first focusable element
		autoCloseOnFooterClick: true, // Auto close when clicking buttons in footer
		onOpen: null,                // Callback: (element) => {}
		onClose: null,               // Callback: (element) => {}
		onBeforeOpen: null,          // Callback: (element) => {} (can return false to cancel)
		onBeforeClose: null          // Callback: (element) => {} (can return false to cancel)
	};

	/**
	 * CSS selectors for elements
	 */
	static SELECTORS = {
		close: '[data-modal-close]',
		closeButton: '.modal__close'
	};

	/**
	 * Track all active modals globally
	 */
	static activeModals = [];

	constructor(selector, options = {}) {
		this.options = { ...Modal.DEFAULT_OPTIONS, ...options };
		this.element = this._getElement(selector);

		if (!this.element) {
			console.warn('[Modal] Element not found for selector:', selector);
			return;
		}

		this.id = this.element.id;
		this.isOpen = false;
		this.triggerElement = null;
		this.focusableElements = [];
		this.firstFocusable = null;
		this.lastFocusable = null;

		this._init();
	}

	/**
	 * Get element from selector
	 */
	_getElement(selector) {
		if (typeof selector === 'string') {
			return document.querySelector(selector);
		}
		if (selector instanceof Element) {
			return selector;
		}
		return null;
	}

	/**
	 * Initialize the modal
	 */
	_init() {
		if (!this.id) {
			console.warn('[Modal] Modal must have an ID:', this.element);
			return;
		}

		// Set up triggers (buttons with data-modal-target matching this modal's ID)
		this._setupTriggers();

		// Set up close buttons
		this._setupCloseButtons();

		// Set up modal events
		this._setupModalEvents();

		// Update focusable elements
		this._updateFocusableElements();

		// Set up keyboard listeners
		this._setupKeyboardListeners();
	}

	/**
	 * Set up trigger buttons
	 */
	_setupTriggers() {
		const triggers = document.querySelectorAll(`[data-modal-target="${this.id}"]`);

		triggers.forEach(trigger => {
			trigger.addEventListener('click', (e) => this._handleTriggerClick(e));
		});
	}

	/**
	 * Set up events for the modal
	 */
	_setupModalEvents() {
		// Backdrop click
		if (this.options.closeOnBackdropClick) {
			this.element.addEventListener('click', (e) => {
				if (e.target === this.element) {
					this.close();
				}
			});
		}

		// Dialog cancel event (ESC key on native dialog)
		this.element.addEventListener('cancel', (e) => {
			if (!this.options.closeOnEscape) {
				e.preventDefault();
			} else {
				this.close();
			}
		});

		// Auto close on footer button click
		if (this.options.autoCloseOnFooterClick) {
			const footer = this.element.querySelector('.modal__footer');
			if (footer) {
				footer.addEventListener('click', (e) => {
					const button = e.target.closest('button');
					// Close if it's a button and doesn't have data-modal-prevent-close
					if (button && !button.hasAttribute('data-modal-prevent-close')) {
						this.close();
					}
				});
			}
		}

		// Animation end
		this.element.addEventListener('animationend', () => {
			if (!this.isOpen) {
				this.element.classList.remove(`modal--${this.options.animation}-out`);
			}
		});
	}

	/**
	 * Set up close buttons
	 */
	_setupCloseButtons() {
		// Close buttons with data-modal-close for this modal
		const closeButtons = this.element.querySelectorAll(`[data-modal-close="${this.id}"]`);
		closeButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				this.close();
			});
		});

		// Generic close button (.modal__close) inside this modal
		const genericCloseBtn = this.element.querySelector(Modal.SELECTORS.closeButton);
		if (genericCloseBtn) {
			genericCloseBtn.addEventListener('click', (e) => {
				e.preventDefault();
				this.close();
			});
		}
	}

	/**
	 * Set up keyboard event listeners
	 */
	_setupKeyboardListeners() {
		// ESC key and focus trap
		this.keydownHandler = (e) => {
			// Only handle if this modal is the active one
			if (!this.isOpen || Modal.activeModals[Modal.activeModals.length - 1] !== this) {
				return;
			}

			if (e.key === 'Escape' && this.options.closeOnEscape) {
				this.close();
			}

			// Focus trap
			if (e.key === 'Tab' && this.options.trapFocus) {
				this._handleFocusTrap(e);
			}
		};

		document.addEventListener('keydown', this.keydownHandler);
	}

	/**
	 * Handle trigger click
	 */
	_handleTriggerClick(e) {
		e.preventDefault();
		const trigger = e.currentTarget;
		this.open(trigger);
	}

	/**
	 * Open the modal
	 * @param {HTMLElement} triggerElement - Element that triggered the modal (optional)
	 */
	open(triggerElement = null) {
		if (this.isOpen) {
			return;
		}

		// Before open callback
		if (this.options.onBeforeOpen) {
			const result = this.options.onBeforeOpen(this.element);
			if (result === false) {
				return;
			}
		}

		// Store trigger element for focus restoration
		if (triggerElement) {
			this.triggerElement = triggerElement;
		} else if (this.options.restoreFocus && document.activeElement) {
			this.triggerElement = document.activeElement;
		}

		// Show modal
		this.element.showModal();
		this.isOpen = true;

		// Add to active stack
		Modal.activeModals.push(this);

		// Lock scroll
		if (this.options.lockScroll) {
			this._lockScroll();
		}

		// Apply animation
		if (this.options.animation) {
			this.element.classList.remove(`modal--${this.options.animation}-out`);
			this.element.classList.add(`modal--${this.options.animation}-in`);
		}

		// Auto focus
		if (this.options.autoFocus) {
			this._focusFirstElement();
		}

		// Callback
		if (this.options.onOpen) {
			this.options.onOpen(this.element);
		}
	}

	/**
	 * Close the modal
	 */
	close() {
		if (!this.isOpen) {
			return;
		}

		// Before close callback
		if (this.options.onBeforeClose) {
			const result = this.options.onBeforeClose(this.element);
			if (result === false) {
				return;
			}
		}

		// Apply exit animation
		if (this.options.animation) {
			this.element.classList.remove(`modal--${this.options.animation}-in`);
			this.element.classList.add(`modal--${this.options.animation}-out`);

			// Wait for animation to finish
			setTimeout(() => {
				this._finalizeClose();
			}, this.options.animationDuration);
		} else {
			this._finalizeClose();
		}
	}

	/**
	 * Finalize modal close
	 */
	_finalizeClose() {
		// Close dialog
		this.element.close();
		this.isOpen = false;

		// Remove from active stack
		const index = Modal.activeModals.indexOf(this);
		if (index > -1) {
			Modal.activeModals.splice(index, 1);
		}

		// Unlock scroll if no modals are open
		if (this.options.lockScroll && Modal.activeModals.length === 0) {
			this._unlockScroll();
		}

		// Restore focus
		if (this.options.restoreFocus && this.triggerElement) {
			this.triggerElement.focus();
		}

		// Callback
		if (this.options.onClose) {
			this.options.onClose(this.element);
		}
	}

	/**
	 * Toggle the modal
	 * @param {HTMLElement} triggerElement - Element that triggered the modal (optional)
	 */
	toggle(triggerElement = null) {
		if (this.isOpen) {
			this.close();
		} else {
			this.open(triggerElement);
		}
	}	/**
	 * Lock body scroll
	 */
	_lockScroll() {
		if (!document.body.hasAttribute('data-modal-scroll-locked')) {
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollbarWidth}px`;
			document.body.setAttribute('data-modal-scroll-locked', 'true');
		}
	}

	/**
	 * Unlock body scroll
	 */
	_unlockScroll() {
		document.body.style.overflow = '';
		document.body.style.paddingRight = '';
		document.body.removeAttribute('data-modal-scroll-locked');
	}

	/**
	 * Update focusable elements in the modal
	 */
	_updateFocusableElements() {
		const focusableSelectors = [
			'a[href]',
			'button:not([disabled])',
			'textarea:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'[tabindex]:not([tabindex="-1"])'
		].join(', ');

		this.focusableElements = Array.from(
			this.element.querySelectorAll(focusableSelectors)
		);

		this.firstFocusable = this.focusableElements[0];
		this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
	}

	/**
	 * Focus first element in modal
	 */
	_focusFirstElement() {
		if (this.firstFocusable) {
			setTimeout(() => {
				this.firstFocusable.focus();
			}, 50);
		}
	}

	/**
	 * Handle focus trap
	 */
	_handleFocusTrap(e) {
		this._updateFocusableElements();

		if (e.shiftKey) {
			// Shift + Tab
			if (document.activeElement === this.firstFocusable) {
				e.preventDefault();
				this.lastFocusable?.focus();
			}
		} else {
			// Tab
			if (document.activeElement === this.lastFocusable) {
				e.preventDefault();
				this.firstFocusable?.focus();
			}
		}
	}	/**
	 * Destroy the instance and clean up event listeners
	 */
	destroy() {
		this.close();
		
		// Remove keyboard listener
		if (this.keydownHandler) {
			document.removeEventListener('keydown', this.keydownHandler);
		}

		// Remove from active stack
		const index = Modal.activeModals.indexOf(this);
		if (index > -1) {
			Modal.activeModals.splice(index, 1);
		}
	}
}
