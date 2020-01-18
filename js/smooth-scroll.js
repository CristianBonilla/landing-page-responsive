export class Scrolling {
  _$currentLink = null;

  constructor($mainLink, [ ...$links ]) {
    this._$mainLink = $mainLink;
    this._$links = $links;
  }

  apply(callback) {
    this._$mainLink.addEventListener('click', event => {
      event.preventDefault();
      this.connectMainAnchor(callback);
    });
    this._$links.forEach(l => {
      l.addEventListener('click', event => {
        event.preventDefault();
        this.connectAnchor(event.currentTarget, callback);
      });
    });
    const link = this.findLink(location.href);
    if (link) {
      this.connectAnchor(link, callback);
    }
  }

  findLink(href) {
    const link = this._$links.find(l => l.href === href);

    return link;
  }

  cleanLinks() {
    this._$links.filter(l => l.classList.contains('active'))
      .forEach(l => l.classList.remove('active'));
    this._$currentLink.classList.add('active');
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
    if (this.isPathnameCorrect(this._$currentLink)) {
      const idElement = this._$currentLink.getAttribute('href');
      const $anchor = document.querySelector(idElement);
      if ($anchor) {
        this.scrolling($anchor, idElement);
        this.cleanLinks();
        if (typeof callback === 'function') {
          callback(this._$currentLink, $anchor);
        }
      }
    }
  }

  scrolling($anchorElement, id) {
    const originalTop = this.distanceToTop($anchorElement);
    window.scrollBy({
      top: originalTop,
      left: 0,
      behavior: 'smooth'
    });
    const checkIfDone = setInterval(() => {
      if (this.distanceToTop($anchorElement) === 0 || this.atBottom()) {
        this.history($anchorElement, id);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  history($anchorElement, id) {
    $anchorElement.tabIndex = '-1';
    $anchorElement.focus();
    window.history.pushState('', '', id);
  }

  distanceToTop($element) {
    const { top } = $element.getBoundingClientRect();

    return Math.floor(top);
  }

  atBottom() {
    return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
  }

  isPathnameCorrect($element) {
    const hasHref = $element.href && $element.href.indexOf('#') >= 0;
    const pathname = location.pathname;
    const equalPathname = $element.pathname === pathname || ('/' + $element.pathname) === pathname;
    const equalSearch = $element.search === location.search;

    return hasHref && equalPathname && equalSearch;
  }
}
