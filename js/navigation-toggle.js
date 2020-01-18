export class Toggle {
  _$html = document.documentElement;
  _$isVisible = false;

  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$menuContent = $menuContent;
    this._$parent = this._$menuContent.parentNode;
    this._mediaQuery = mediaQuery;
  }

  get isVisible() {
    return this._$isVisible;
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
        this.heightFormat(0);
        this.removeClass();
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
    setTimeout(() => {
      this.heightFormat(height);
      this._$menuContent.addEventListener('transitionend', () => {
        this._$isVisible = true;
      }, { once: true });
    });
  }

  hide() {
    this.heightFormat(0);
    this._$menuContent.addEventListener('transitionend', () => {
      this.removeClass();
      this._$isVisible = false;
    }, { once: true });
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
