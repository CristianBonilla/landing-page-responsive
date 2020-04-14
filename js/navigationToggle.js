class Toggle {
  _$html = document.documentElement;
  _isVisible = false;
  _handler = null;
  _menuHeight = 0;

  constructor($toggler, $menuContent) {
    this.$toggler = $toggler;
    this.$nav = this.$toggler.parentNode;
    this.$menuContent = $menuContent;
    this.resizeListener = _ => {
      this.defineHeight(this._menuHeight);
      this.defineMaxHeight(this._menuHeight);
    };
  }

  get isVisible() {
    return this._isVisible;
  }

  get handler() {
    return this._handler;
  }

  set handler(handler) {
    this._handler = handler;
  }

  show() {
    this.$menuContent.classList.add('show');
    this._menuHeight = this.$menuContent.offsetHeight;
    this.$menuContent.classList.add('toggle');
    this.transitionEnd(false);
    setTimeout(() => {
      this.resizeListener();
      window.addEventListener('resize', this.resizeListener);
    }, 10);
  }

  hide() {
    this.transitionEnd(true, () => this.defineMaxHeight(0));
    this.defineHeight(0);
    window.removeEventListener('resize', this.resizeListener);
  }

  navbarHeight() {
    const navHeight = this.$nav.offsetHeight;
    const menuHeight = this.$menuContent.offsetHeight;

    return navHeight > menuHeight ? navHeight - menuHeight : navHeight;
  }

  toggle(event) {
    event.preventDefault();

    if (this.hasClassMenu('toggle', 'show')) {
      this.hide();
    } else {
      this.show();
    }
  }

  toggleScope({ target }) {
    const { display } = window.getComputedStyle(this.$menuContent);
    if (!this.$nav.contains(target) && display !== 'none') {
      this.hide();
    }
  }

  mediaQueryChange(matches, toggleListener, scopeListener) {
    if (matches) {
      this.$toggler.addEventListener('click', toggleListener);
      this._$html.addEventListener('click', scopeListener);
    } else {
      this.$toggler.removeEventListener('click', toggleListener);
      this._$html.addEventListener('click', scopeListener);
      this.defineHeight(0);
      this.removeClass();
    }

    if (typeof this._handler === 'function') {
      this._handler();
    }
  }

  transitionEnd(finalize, listener) {
    this.$menuContent.addEventListener('transitionend', _ => {
      if (finalize) {
        this.removeClass();
      }
      this._isVisible = !finalize;

      if (typeof listener === 'function') {
        listener();
      }

      if (typeof this._handler === 'function') {
        this._handler();
      }
    }, { once: true });
  }

  hasClassMenu(...classes) {
    return classes.every(hasClass => this.$menuContent.classList.contains(hasClass));
  }

  defineHeight(height) {
    this.$menuContent.style.height = height > 0 ? `${ height }px` : '';
  }

  defineMaxHeight(height) {
    const maxHeight = window.outerHeight - this.navbarHeight();
    this.$menuContent.style.maxHeight = height > maxHeight ? `${ maxHeight - 10 }px` : '';
    this.$menuContent.style.overflowY = height > maxHeight ? 'auto' : '';
  }

  removeClass() {
    this.$menuContent.classList.remove('toggle', 'show');
  }
}

export class NavigationToggle {
  constructor($toggler, $menuContent, mediaQuery) {
    this._factory = new Toggle($toggler, $menuContent);
    this.mediaQuery = mediaQuery;
  }

  mount() {
    const toggleListener = event => this._factory.toggle(event);
    const scopeListener = event => this._factory.toggleScope(event);

    // this._mediaQuery.addEventListener('change', ({ matches }) => {
    this.mediaQuery.addListener(({ matches }) =>
      this._factory.mediaQueryChange(matches, toggleListener, scopeListener));
    // const mediaQueryEvent = new MediaQueryListEvent('change', {
    //   bubbles: false,
    //   cancelable: false,
    //   matches: this._mediaQuery.matches
    // });
    // this._mediaQuery.dispatchEvent(changeEvent);

    this._factory.mediaQueryChange(
      this.mediaQuery.matches,
      toggleListener,
      scopeListener);

    return this._factory;
  }
}
