import Component from '../Component';

/**
 * Tabs Component — accessible tab management with keyboard navigation.
 *
 * @example
 * new Tabs('#myTabs', {
 *   animation: 'fade',
 *   saveSelection: true,
 *   onChange: (tabId, panel) => console.log(tabId),
 * });
 */
export default class Tabs extends Component {
  static defaults = {
    saveSelection: false,
    defaultTab: 0,
    enableKeyboard: true,
    animation: null,
    animationDuration: 300,
    autoActivate: true,
    onChange: null,
    onInit: null,
  };

  static SELECTORS = {
    nav: '.tabs__nav',
    content: '.tabs__content',
    button: '.tabs__button',
    panel: '.tabs__panel',
  };

  init() {
    this._nav = this.$(Tabs.SELECTORS.nav);
    this._content = this.$(Tabs.SELECTORS.content);

    if (!this._nav || !this._content) {
      console.warn('[Tabs] Missing .tabs__nav or .tabs__content:', this.el);
      return;
    }

    this._buttons = this.$$(Tabs.SELECTORS.button);
    this._panels = this.$$(Tabs.SELECTORS.panel);
    this._activeIndex = -1;

    if (!this._buttons.length || !this._panels.length) {
      console.warn('[Tabs] No buttons or panels found');
      return;
    }

    // Click events
    this.on('click', this._nav, (e) => {
      const btn = e.target.closest(Tabs.SELECTORS.button);
      if (btn) this.activateTab(this._buttons.indexOf(btn));
    });

    // Keyboard
    if (this.options.enableKeyboard) {
      this.on('keydown', this._nav, (e) => this._handleKeyboard(e));
    }

    // Hash
    if (this.options.saveSelection) {
      this._hashHandler = () => this._handleHash(true);
      window.addEventListener('hashchange', this._hashHandler);
    }

    // Init default
    if (this.options.saveSelection) {
      this._handleHash(false);
    } else {
      this._activateDefault();
    }

    this.options.onInit?.(this);
  }

  // ── Public API ───────────────────────────────────────

  activateTab(index, setFocus = true) {
    if (index < 0 || index >= this._buttons.length) return;

    const button = this._buttons[index];
    const panelId = button.getAttribute('aria-controls');
    const panel = this._panels.find(p => p.id === panelId);
    if (!panel) return;

    // Deactivate all
    this._buttons.forEach(btn => {
      btn.setAttribute('aria-selected', 'false');
      btn.tabIndex = -1;
    });
    this._panels.forEach(p => {
      p.setAttribute('hidden', '');
      if (this.options.animation) {
        p.classList.remove(`tabs__panel--${this.options.animation}-in`);
      }
    });

    // Activate target
    button.setAttribute('aria-selected', 'true');
    button.tabIndex = 0;
    if (setFocus) button.focus();

    panel.removeAttribute('hidden');
    if (this.options.animation) {
      requestAnimationFrame(() => {
        panel.classList.add(`tabs__panel--${this.options.animation}-in`);
      });
    }

    this._activeIndex = index;
    this._updateHash(button);
    this.options.onChange?.(button.id, panel);
    this.emit('tabs:change', { index, button, panel });
  }

  next() {
    this.activateTab((this._activeIndex + 1) % this._buttons.length);
  }

  prev() {
    this.activateTab(
      this._activeIndex === 0 ? this._buttons.length - 1 : this._activeIndex - 1
    );
  }

  // ── Private ──────────────────────────────────────────

  _activateDefault() {
    const pre = this._buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
    this.activateTab(pre !== -1 ? pre : this.options.defaultTab, false);
  }

  _handleKeyboard(e) {
    const idx = this._buttons.findIndex(b => b === document.activeElement);
    if (idx === -1) return;

    let newIdx = idx;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIdx = idx > 0 ? idx - 1 : this._buttons.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIdx = idx < this._buttons.length - 1 ? idx + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIdx = 0;
        break;
      case 'End':
        e.preventDefault();
        newIdx = this._buttons.length - 1;
        break;
      default:
        return;
    }

    this._buttons[newIdx].focus();
    if (this.options.autoActivate) this.activateTab(newIdx, false);
  }

  _updateHash(button) {
    if (!this.options.saveSelection || !button.id) return;
    const hash = this.el.id ? `${this.el.id}-${button.id}` : button.id;
    if (window.location.hash !== `#${hash}`) {
      history.replaceState(null, '', `#${hash}`);
    }
  }

  _handleHash(setFocus) {
    const hash = window.location.hash.substring(1);
    let activated = false;

    if (hash) {
      const index = this._buttons.findIndex(btn => {
        if (!btn.id) return false;
        const expected = this.el.id ? `${this.el.id}-${btn.id}` : btn.id;
        return hash === expected;
      });
      if (index !== -1) {
        this.activateTab(index, setFocus);
        activated = true;
      }
    }

    if (!activated) this._activateDefault();
  }

  destroy() {
    if (this._hashHandler) {
      window.removeEventListener('hashchange', this._hashHandler);
    }
    super.destroy();
  }
}
