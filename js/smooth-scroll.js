export class Scrolling {
  // Experimental class-fields
  // _$currentLink = null;

  constructor($mainLink, ...$links) {
    this._$mainLink = $mainLink;
    this._$currentLink = null;
    this.anchors = $links.map(l => this._anchorObject(l));
  }

  mount(activeHandler = null) {
    this._$mainLink.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
    for (const anchor of this.anchors) {
      anchor.$link.addEventListener('click', e => {
        e.preventDefault();
        this._updateAnchorTopDistance(anchor.$link);
        this.anchorScrolling(anchor, activeHandler);
      });
    }
    const anchor = this.findAnchorByHref(location.href);
    if (anchor) {
      this.anchorScrolling(anchor, activeHandler);
    }
  }

  findAnchorByHref(href) {
    const anchor = this.anchors.find(a => a.$link.href === href);

    return anchor;
  }

  resetLinksActive() {
    for (const { $link } of this.anchors) {
      if ($link !== this._$currentLink) {
        $link.classList.remove('active');
      } else {
        $link.classList.add('active');
      }
    }
  }

  anchorScrolling({ id, $anchor, $link, topDistance }, activeHandler) {
    if (!this._isPathnameCorrect($link) || this._$currentLink === $link) {
      return;
    }
    if ($anchor) {
      this._$currentLink = $link;
      this.resetLinksActive();
      this._scrolling(id, $anchor, topDistance);
      if (typeof activeHandler === 'function') {
        activeHandler(this._$currentLink, $anchor);
      }
    }
  }

  _updateAnchorTopDistance($link) {
    const anchorObject = this.anchors.find(a => a.$link === $link);
    if (anchorObject) {
      anchorObject.topDistance = this._topDistance(anchorObject.$anchor);
    }
  }

  _anchorObject($link) {
    const id = $link.getAttribute('href');
    const $anchor = document.querySelector(id);
    const topDistance = $anchor ? this._topDistance($anchor) : 0;

    return {
      id,
      $anchor,
      $link,
      topDistance
    };
  }

  _scrolling(id, $anchor, topDistance) {
    window.scrollBy({
      top: topDistance,
      left: 0,
      behavior: 'smooth'
    });
    const checkIfDone = setInterval(() => {
      if (this._topDistance($anchor) === 0 || this._atBottom()) {
        this._history(id, $anchor);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  _history(id, $anchor) {
    this.anchors.filter(a => a.$anchor.hasAttribute('tabindex'))
      .forEach(a => a.$anchor.removeAttribute('tabindex'));
    $anchor.tabIndex = '-1';
    $anchor.focus();
    window.history.pushState('', '', id);
  }

  _topDistance($anchor) {
    const { top } = $anchor.getBoundingClientRect();

    return Math.floor(top);
  }

  _atBottom() {
    return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
  }

  _isPathnameCorrect($link) {
    const hasHref = $link.href && $link.href.indexOf('#') >= 0;
    const pathname = location.pathname;
    const equalPathname = $link.pathname === pathname || ('/' + $link.pathname) === pathname;
    const equalSearch = $link.search === location.search;

    return hasHref && equalPathname && equalSearch;
  }
}
