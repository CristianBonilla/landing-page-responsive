export class Scrolling {
  // Experimental class-fields
  // _$currentLink = null;

  constructor($mainLink, ...$links) {
    this._$mainLink = $mainLink;
    this._$currentLink = null;
    this._anchors = $links.map($l => this._anchor($l));
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
    for (const anchor of this._anchors) {
      anchor.$link.addEventListener('click', e => {
        e.preventDefault();
        this.anchorScrolling(anchor, activeHandler);
      });
    }
    const anchor = this.anchorByHref(location.href);
    if (anchor) {
      this.anchorScrolling(anchor, activeHandler);
    }
    window.addEventListener('scroll', () => {
      const fromTop = window.scrollY;
      const anchor = this.anchorScrollingPosition(fromTop);
      if (anchor && anchor.$link !== this._$currentLink) {
        this.anchorActive(anchor, false);
      }
    });
  }

  resetLinksActive() {
    for (const { $link } of this._anchors) {
      if ($link !== this._$currentLink) {
        $link.classList.remove('active');
      } else {
        $link.classList.add('active');
      }
    }
  }

  anchorScrollingPosition(fromTop) {
    const anchor = this._anchors.find(({ $anchor }) =>
      $anchor.offsetTop <= fromTop && $anchor.offsetTop + $anchor.offsetHeight > fromTop);

    return anchor;
  }

  anchorScrolling(anchor, activeHandler) {
    const { $link, $anchor } = anchor;
    if (!this._isPathnameCorrect($link) || this._$currentLink === $link) {
      return;
    }
    if ($anchor) {
      this.anchorActive(anchor);
      if (typeof activeHandler === 'function') {
        activeHandler($link, $anchor);
      }
    }
  }

  anchorActive({ id, $link, $anchor }, smooth = true) {
    this._$currentLink = $link;
    this.resetLinksActive();
    if (smooth) {
      this._scrolling(id, $anchor);
    } else {
      this._history(id, $anchor);
    }
  }

  anchorByHref(href) {
    const anchor = this._anchors.find(({ $link }) => $link.href === href);

    return anchor;
  }

  _anchor($link) {
    const id = $link.getAttribute('href');
    const $anchor = document.querySelector(id);

    return {
      id,
      $anchor,
      $link
    };
  }

  _scrolling(id, $anchor) {
    const top = this._distanceTop($anchor);
    window.scrollBy({
      top,
      left: 0,
      behavior: 'smooth'
    });
    const checkIfDone = setInterval(() => {
      const topChange = this._distanceTop($anchor);
      if (topChange <= 0 || this._atBottom()) {
        this._history(id, $anchor);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  _history(id, $anchor) {
    $anchor.focus();
    window.history.pushState('', '', id);
  }

  _distanceTop($anchor) {
    const { top } = $anchor.getBoundingClientRect();

    return top;
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
