import Component from '../Component';

/**
 * Pagination Component — prev/next navigation with active state tracking.
 *
 * @example
 * Pagination.autoInit('.pagination');
 */
export default class Pagination extends Component {
  static defaults = {
    onChange: null,
  };

  static SEL = {
    list: '.pagination__list',
    item: '.pagination__item',
    link: '.pagination__link',
    linkPage: '.pagination__link:not(.pagination__link--prev):not(.pagination__link--next)',
    prev: '.pagination__link--prev',
    next: '.pagination__link--next',
    ellipsis: '.pagination__ellipsis',
    active: '.pagination__item--active',
  };

  init() {
    this._list = this.$(Pagination.SEL.list);
    this._pageLinks = this.$$(Pagination.SEL.linkPage);
    this._prevItem = this.el.querySelector(`.pagination__item:has(${Pagination.SEL.prev})`);
    this._nextItem = this.el.querySelector(`.pagination__item:has(${Pagination.SEL.next})`);
    this._prevLink = this._prevItem?.querySelector(Pagination.SEL.prev);
    this._nextLink = this._nextItem?.querySelector(Pagination.SEL.next);

    // Page link clicks
    this._pageLinks.forEach(link => {
      this.on('click', link, (e) => this._onPageClick(e));
    });

    if (this._prevLink) this.on('click', this._prevLink, (e) => this._onPrev(e));
    if (this._nextLink) this.on('click', this._nextLink, (e) => this._onNext(e));

    // Init prev/next state
    const activeLink = this.$(Pagination.SEL.active + ' ' + Pagination.SEL.link);
    if (activeLink) {
      this._updatePrevNext();
    } else if (this._prevItem && this._prevLink) {
      this._prevItem.classList.add('pagination__item--disabled');
      this._prevLink.setAttribute('aria-disabled', 'true');
    }
  }

  // ── Public ───────────────────────────────────────────

  setActive(link) {
    if (!link) return;

    // Clear current active
    this.$$(Pagination.SEL.active).forEach(item => {
      item.classList.remove('pagination__item--active');
      item.querySelector(Pagination.SEL.link)?.removeAttribute('aria-current');
    });

    const parentItem = link.closest(Pagination.SEL.item);
    if (parentItem) {
      parentItem.classList.add('pagination__item--active');
      link.setAttribute('aria-current', 'page');
    }

    this._updatePrevNext();
    this.options.onChange?.(link);
    this.emit('pagination:change', { link });
  }

  // ── Private ──────────────────────────────────────────

  _updatePrevNext() {
    const activeItem = this.$(Pagination.SEL.active);
    const firstPageItem = this.el.querySelector(
      `.pagination__item:not(:has(${Pagination.SEL.prev})):not(:has(${Pagination.SEL.ellipsis}))`
    );
    const numberedItems = Array.from(this.el.querySelectorAll(
      `.pagination__item:has(${Pagination.SEL.linkPage})`
    ));
    const lastPageItem = numberedItems[numberedItems.length - 1];

    if (this._prevItem && this._prevLink) {
      const isFirst = activeItem === firstPageItem;
      this._prevItem.classList.toggle('pagination__item--disabled', isFirst);
      isFirst
        ? this._prevLink.setAttribute('aria-disabled', 'true')
        : this._prevLink.removeAttribute('aria-disabled');
    }

    if (this._nextItem && this._nextLink) {
      const isLast = activeItem === lastPageItem;
      this._nextItem.classList.toggle('pagination__item--disabled', isLast);
      isLast
        ? this._nextLink.setAttribute('aria-disabled', 'true')
        : this._nextLink.removeAttribute('aria-disabled');
    }
  }

  _onPageClick(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const item = link.closest(Pagination.SEL.item);
    if (!item || item.classList.contains('pagination__item--active') || item.classList.contains('pagination__item--disabled')) return;
    this.setActive(link);
  }

  _onPrev(e) {
    e.preventDefault();
    if (this._prevItem?.classList.contains('pagination__item--disabled')) return;
    let prev = this.$(Pagination.SEL.active)?.previousElementSibling;
    if (prev?.querySelector(Pagination.SEL.ellipsis)) prev = prev.previousElementSibling;
    const link = prev?.querySelector(Pagination.SEL.linkPage);
    if (link) this.setActive(link);
  }

  _onNext(e) {
    e.preventDefault();
    if (this._nextItem?.classList.contains('pagination__item--disabled')) return;
    let next = this.$(Pagination.SEL.active)?.nextElementSibling;
    if (next?.querySelector(Pagination.SEL.ellipsis)) next = next.nextElementSibling;
    const link = next?.querySelector(Pagination.SEL.linkPage);
    if (link) this.setActive(link);
  }
}
