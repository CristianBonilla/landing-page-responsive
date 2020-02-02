export class Toggle {
  // Experimental class-fields
  // _$html = document.documentElement;
  // _$isVisible = false;
  // _handler = null;

  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$nav = this._$toggler.parentNode;
    this._$menuContent = $menuContent;
    this._mediaQuery = mediaQuery;
    this._$html = document.documentElement;
    this._$isVisible = false;
    this._handler = null;
  }

  get isVisible() {
    return this._$isVisible;
  }

  get navbarHeight() {
    return this._navbarHeight();
  }

  set handler(handler) {
    this._handler = handler;
  }

  mount() {
    const toggleListener = e => this._toggle(e);
    const scopeListener = e => this._toggleScope(e);
    // this._mediaQuery.addEventListener('change', ({ matches }) => {
    this._mediaQuery.addListener(({ matches }) =>
      this._mediaQueryChange(matches, toggleListener, scopeListener));
    // const mediaQueryEvent = new MediaQueryListEvent('change', {
    //   bubbles: false,
    //   cancelable: false,
    //   matches: this._mediaQuery.matches
    // });
    // this._mediaQuery.dispatchEvent(changeEvent);
    this._mediaQueryChange(
      this._mediaQuery.matches,
      toggleListener,
      scopeListener);
  }

  show() {
    this._$menuContent.classList.add('show');
    const menuHeight = this._$menuContent.offsetHeight;
    this._$menuContent.classList.add('toggle');
    this._$menuContent.addEventListener('transitionend', () => {
      this._$isVisible = true;
      if (typeof this._handler === 'function') {
        this._handler();
      }
    }, { once: true });
    setTimeout(() => this._heightFormat(menuHeight), 10);
  }

  hide() {
    this._$menuContent.addEventListener('transitionend', () => {
      this._removeClass();
      this._$isVisible = false;
      if (typeof this._handler === 'function') {
        this._handler();
      }
    }, { once: true });
    this._heightFormat(0);
  }

  _toggle(event) {
    event.preventDefault();
    if (this._hasClassMenu('toggle', 'show')) {
      this.hide();
    } else {
      this.show();
    }
  }

  _toggleScope({ target }) {
    const { display } = window.getComputedStyle(this._$menuContent);
    if (!this._$nav.contains(target) && display !== 'none') {
      this.hide();
    }
  }

  _mediaQueryChange(matches, toggleListener, scopeListener) {
    if (matches) {
      this._$toggler.addEventListener('click', toggleListener);
      this._$html.addEventListener('click', scopeListener);
    } else {
      this._$toggler.removeEventListener('click', toggleListener);
      this._$html.removeEventListener('click', scopeListener);
      this._heightFormat(0);
      this._removeClass();
    }
    if (typeof this._handler === 'function') {
      this._handler();
    }
  }

  _navbarHeight() {
    const navHeight = this._$nav.offsetHeight;
    const menuHeight = this._$menuContent.offsetHeight;

    return navHeight > menuHeight ? navHeight - menuHeight : navHeight;
  }

  _hasClassMenu(...classes) {
    return classes.every(c => this._$menuContent.classList.contains(c));
  }

  _heightFormat(height) {
    this._$menuContent.style.height = height > 0 ? `${ height }px` : '';
  }

  _removeClass() {
    this._$menuContent.classList.remove('toggle', 'show');
  }
}
