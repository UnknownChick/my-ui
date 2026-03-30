import Component from '../Component';

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
    position: 'left',
  };

  static VALID_POSITIONS = ['left', 'right'];

  init() {
    if (!Drawer.VALID_POSITIONS.includes(this.options.position)) {
      console.warn(`[Drawer] Invalid position "${this.options.position}", using "left".`);
      this.options.position = 'left';
    }

    this.addClass(`drawer--${this.options.position}`);
    this._isOpen = false;

    // Backdrop
    this._backdrop = document.createElement('div');
    this._backdrop.className = 'drawer__backdrop';
    this.el.insertAdjacentElement('afterend', this._backdrop);

    // Close button
    const closeBtn = this.$('.drawer__close');
    if (closeBtn) {
      this.on('click', closeBtn, () => this.close());
    }

    // Backdrop click
    this._backdrop.addEventListener('click', () => this.close());

    // External triggers
    if (this.el.id) {
      document.querySelectorAll(`[data-drawer-target="${this.el.id}"]`).forEach(trigger => {
        trigger.addEventListener('click', () => this.toggle());
      });
    }

    // Escape key
    this._escHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) this.close();
    };
    document.addEventListener('keydown', this._escHandler);
  }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this.addClass('drawer--open');
    this._backdrop.classList.add('drawer__backdrop--visible');
    this.el.setAttribute('aria-hidden', 'false');
    this.emit('drawer:open');
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this.removeClass('drawer--open');
    this._backdrop.classList.remove('drawer__backdrop--visible');
    this.el.setAttribute('aria-hidden', 'true');
    this.emit('drawer:close');
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  destroy() {
    document.removeEventListener('keydown', this._escHandler);
    this._backdrop?.remove();
    super.destroy();
  }
}
