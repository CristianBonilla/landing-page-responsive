export class Scrolling {
  // Experimental class-fields
  // _$currentLink = null;

  constructor($mainLink, ...$links) {
    this._$mainLink = $mainLink;
    this._$links = $links;
    this._$currentLink = null;
  }

  apply(callback) {
    this._$mainLink.addEventListener('click', e => {
      e.preventDefault();
      this.connectMainAnchor(callback);
    });
    this._$links.forEach(l => {
      l.addEventListener('click', e => {
        e.preventDefault();
        this.connectAnchor(e.currentTarget, callback);
      });
    });
    const $link = this.findLink(location.href);
    if ($link) {
      this.connectAnchor($link, callback);
    }
  }

  connectMainAnchor(callback = null) {
    const link = this.findLink(this._$mainLink.href);
    if (link) {
      this.connectAnchor(link, callback);
    } else {
      this.connectAnchor(this._$mainLink, callback);
    }
  }

  connectAnchor(element, callback = null) {
    if (this._$currentLink === element) {
      return;
    }
    this._$currentLink = element;
    if (this._isPathnameCorrect(this._$currentLink)) {
      const idElement = this._$currentLink.getAttribute('href');
      const $anchor = document.querySelector(idElement);
      if ($anchor) {
        this._scrolling($anchor, idElement);
        this.resetLinksActive();
        if (typeof callback === 'function') {
          callback(this._$currentLink, $anchor);
        }
      }
    }
  }

  findLink(href) {
    const link = this._$links.find(l => l.href === href);

    return link;
  }

  resetLinksActive() {
    this._$links.filter(l => l.classList.contains('active'))
      .forEach(l => l.classList.remove('active'));
    this._$currentLink.classList.add('active');
  }

  _scrolling($anchorElement, id) {
    const originalTop = this._distanceToTop($anchorElement);
    window.scrollBy({
      top: originalTop,
      left: 0,
      behavior: 'smooth'
    });
    const checkIfDone = setInterval(() => {
      if (this._distanceToTop($anchorElement) === 0 || this._atBottom()) {
        this._history($anchorElement, id);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  _history($anchorElement, id) {
    // $anchorElement.tabIndex = '-1';
    $anchorElement.focus();
    window.history.pushState('', '', id);
  }

  _distanceToTop($element) {
    const { top } = $element.getBoundingClientRect();

    return Math.floor(top);
  }

  _atBottom() {
    return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
  }

  _isPathnameCorrect($element) {
    const hasHref = $element.href && $element.href.indexOf('#') >= 0;
    const pathname = location.pathname;
    const equalPathname = $element.pathname === pathname || ('/' + $element.pathname) === pathname;
    const equalSearch = $element.search === location.search;

    return hasHref && equalPathname && equalSearch;
  }
}
