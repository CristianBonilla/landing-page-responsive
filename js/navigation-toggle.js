export class Toggle {
  // Experimental class-fields
  // _$html = document.documentElement;
  // _$isVisible = false;

  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$menuContent = $menuContent;
    this._$parent = this._$menuContent.parentNode;
    this._mediaQuery = mediaQuery;
    this._$html = document.documentElement;
    this._$isVisible = false;
  }

  get isVisible() {
    return this._$isVisible;
  }

  apply() {
    const toggleListener = this.toggle.bind(this);
    const scopeListener = this._toggleScope.bind(this);
    // this._mediaQuery.addEventListener('change', ({ matches }) => {
    this._mediaQuery.addListener(({ matches }) => {
      this._mediaQueryChange(matches, toggleListener, scopeListener);
    });
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
    const height = this._$menuContent.offsetHeight;
    this._$menuContent.classList.add('toggle');
    setTimeout(() => {
      this._heightFormat(height);
      this._$menuContent.addEventListener('transitionend', () => {
        this._$isVisible = true;
      }, { once: true });
    });
  }

  hide() {
    this._heightFormat(0);
    this._$menuContent.addEventListener('transitionend', () => {
      this._removeClass();
      this._$isVisible = false;
    }, { once: true });
  }

  toggle(event) {
    event.preventDefault();
    if (this._hasClassMenu('toggle', 'show')) {
      this.hide();
    } else {
      this.show();
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
  }

  _hasClassMenu(...classes) {
    return classes.every(c => this._$menuContent.classList.contains(c));
  }

  _toggleScope({ target }) {
    const { offsetWidth, offsetHeight } = this._$menuContent;
    if (!this._$parent.contains(target) && offsetWidth > 0 && offsetHeight > 0) {
      this.hide();
    }
  }

  _heightFormat(height) {
    this._$menuContent.style.height = height > 0 ? `${ height }px` : '';
  }

  _removeClass() {
    this._$menuContent.classList.remove('toggle', 'show');
  }
}
