import Component from '../Component';

/**
 * Toast Component
 *
 * The trigger element opens a temporary notification toast.
 *
 * @example
 * new Toast('#btn', {
 *   title: 'Done!',
 *   message: '<p>Saved successfully.</p>',
 *   position: 'top right',
 *   showProgress: true,
 * });
 */
export default class Toast extends Component {
  static defaults = {
    duration: 5000,
    message: '',
    position: 'bottom right',
    showProgress: true,
    title: '',
    transitionDuration: 300,
  };

  static POSITION_MAP = {
    'top left': 'tl',
    'top right': 'tr',
    'bottom left': 'bl',
    'bottom right': 'br',
  };

  init() {
    this._activeToasts = [];
    this.on('click', () => this.show());
  }

  show(overrides = {}) {
    const opts = { ...this.options, ...overrides };
    const posClass = Toast.POSITION_MAP[opts.position] || 'br';

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast--${posClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    if (opts.showProgress) {
      const bar = document.createElement('div');
      bar.className = 'toast__progress';
      bar.style.animationDuration = `${opts.duration / 1000}s`;
      toastEl.appendChild(bar);
    }

    const content = document.createElement('div');
    content.className = 'toast__content';

    if (opts.title) {
      const titleEl = document.createElement('b');
      titleEl.textContent = opts.title;
      content.appendChild(titleEl);
    }

    const msgEl = document.createElement('div');
    msgEl.innerHTML = opts.message;
    content.appendChild(msgEl);

    toastEl.appendChild(content);
    document.body.appendChild(toastEl);
    this._activeToasts.push(toastEl);

    // Force reflow then show
    void toastEl.offsetHeight;
    toastEl.classList.add('toast--active');

    const timeoutId = setTimeout(() => this._close(toastEl), opts.duration);
    toastEl.dataset.timeoutId = timeoutId;
    toastEl.dataset.position = posClass;

    this.emit('toast:show', { element: toastEl });
  }

  _close(toastEl) {
    if (!toastEl || !document.body.contains(toastEl)) return;

    clearTimeout(Number(toastEl.dataset.timeoutId));

    const isLeft = toastEl.dataset.position?.includes('l');
    const closingClass = isLeft ? 'toast--closing-left' : 'toast--closing-right';

    toastEl.classList.remove('toast--active');
    toastEl.classList.add(closingClass);

    const remove = () => {
      toastEl.remove();
      this._activeToasts = this._activeToasts.filter(t => t !== toastEl);
    };

    toastEl.addEventListener('transitionend', remove, { once: true });

    // Fallback removal
    setTimeout(() => {
      if (document.body.contains(toastEl)) remove();
    }, this.options.transitionDuration + 50);

    this.emit('toast:close', { element: toastEl });
  }

  destroy() {
    this._activeToasts.forEach(t => this._close(t));
    super.destroy();
  }
}
