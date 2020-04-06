export class Toggle {
  _$html = document.documentElement;
  _$isVisible = false;
  _handler = null;

  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$nav = this._$toggler.parentNode;
    this._$menuContent = $menuContent;
    this._mediaQuery = mediaQuery;
  }

  get isVisible() {
    return this._$isVisible;
  }

  set handler(handler) {
    this._handler = handler;
  }

  mount() {
    const toggleListener = event => this._toggle(event);
    const scopeListener = event => this._toggleScope(event);
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
    this._transitionEnd(true);
    setTimeout(() => this._heightFormat(menuHeight), 10);
  }

  hide() {
    this._transitionEnd(false);
    this._heightFormat(0);
  }

  navbarHeight() {
    const navHeight = this._$nav.offsetHeight;
    const menuHeight = this._$menuContent.offsetHeight;

    return navHeight > menuHeight ? navHeight - menuHeight : navHeight;
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

  _transitionEnd(isVisible) {
    this._$menuContent.addEventListener('transitionend', _ => {
      if (!isVisible) {
        this._removeClass();
      }
      this._$isVisible = isVisible;
      if (typeof this._handler === 'function') {
        this._handler();
      }
    }, { once: true });
  }

  _hasClassMenu(...classes) {
    return classes.every(hasClass => this._$menuContent.classList.contains(hasClass));
  }

  _heightFormat(height) {
    this._$menuContent.style.height = height > 0 ? `${ height }px` : '';
  }

  _removeClass() {
    this._$menuContent.classList.remove('toggle', 'show');
  }
}
