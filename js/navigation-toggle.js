export class Toggle {
  _$html = document.documentElement;

  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$menuContent = $menuContent;
    this._$parent = this._$menuContent.parentNode;
    this._mediaQuery = mediaQuery;
  }

  apply() {
    const toggleListener = this.toggle.bind(this);
    const scopeListener = this.elementScope.bind(this);
    this._mediaQuery.addEventListener('change', ({ matches }) => {
      if (matches) {
        this._$toggler.addEventListener('click', toggleListener);
        this._$html.addEventListener('click', scopeListener);
      } else {
        this._$toggler.removeEventListener('click', toggleListener);
        this._$html.removeEventListener('click', scopeListener);
        this.removeClass();
        this.heightFormat(0);
      }
    });

    const mediaQueryEvent = new MediaQueryListEvent('change', {
      bubbles: false,
      cancelable: false,
      matches: this._mediaQuery.matches
    });
    this._mediaQuery.dispatchEvent(mediaQueryEvent);
  }

  elementScope({ target }) {
    const { offsetWidth, offsetHeight } = this._$menuContent;
    if (!this._$parent.contains(target) && offsetWidth > 0 && offsetHeight > 0) {
      this.hide();
    }
  }

  heightFormat(height) {
    this._$menuContent.style.height = height > 0 ? `${ height }px` : '';
  }

  removeClass() {
    this._$menuContent.classList.remove('toggle');
    this._$menuContent.classList.remove('show');
  }

  show() {
    this._$menuContent.classList.add('show');
    const height = this._$menuContent.offsetHeight;
    this._$menuContent.classList.add('toggle');
    setTimeout(() => this.heightFormat(height));
  }

  hide() {
    this.heightFormat(0);
    const removeClassListener = this.removeClass.bind(this);
    this._$menuContent.addEventListener(
      'transitionend',
      removeClassListener,
      { once: true });
  }

  toggle(event) {
    event.preventDefault();
    if (this._$menuContent.classList.contains('toggle')) {
      this.hide();
    } else {
      this.show();
    }
  }
}
