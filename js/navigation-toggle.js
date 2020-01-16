export class Toggle {
  constructor($toggler, $menuContent, mediaQuery) {
    this._$toggler = $toggler;
    this._$menuContent = $menuContent;
    this._mediaQuery = mediaQuery;
  }

  apply() {
    const toggleListener = this.toggle.bind(this);
    this._mediaQuery.addEventListener('change', ({ matches }) => {
      if (matches) {
        this._$toggler.addEventListener('click', toggleListener);
      } else {
        this._$toggler.removeEventListener('click', toggleListener);
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
