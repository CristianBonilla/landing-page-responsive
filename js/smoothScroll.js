export class Scrolling {
  // Experimental class-fields
  // _$currentLink = null;
  // _handler = null;

  constructor($mainLink, [ ...$links ], navbarHeight = 0) {
    this._$mainLink = $mainLink;
    this._anchors = $links.map($l => this._anchor($l));
    this._$currentLink = null;
    this._handler = null;
    this._scrollListener = () =>
      this.anchorCurrentPosition(false);
    this._navbarHeight = navbarHeight;
  }

  get navbarHeight() {
    return this._navbarHeight;
  }

  set navbarHeight(navHeight) {
    this._navbarHeight = navHeight;
  }

  set handler(handler) {
    this._handler = handler;
  }

  mount() {
    this._$mainLink.addEventListener('click', e => {
      e.preventDefault();
      if (window.scrollY === 0) {
        return;
      }
      window.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: 0
      });
      if (typeof this._handler === 'function') {
        this._handler(this._$mainLink, null);
      }
    });

    for (const anchor of this._anchors) {
      anchor.$link.addEventListener('click', e => {
        e.preventDefault();
        this.anchorScrolling(anchor);
      });
    }

    const anchor = this.anchorByHref(location.href);
    if (anchor) {
      this.anchorScrolling(anchor);
    } else {
      this.anchorCurrentPosition();
    }

    window.addEventListener('scroll', this._scrollListener);
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

  anchorCurrentPosition(smooth = true) {
    const anchor = this.anchorScrollingPosition();
    if (anchor && anchor.$link !== this._$currentLink) {
      this.anchorActive(anchor, smooth);
    }
  }

  anchorScrollingPosition() {
    const anchor = this._anchors.find(({ $anchor }) => {
      const { top, bottom } = this._distance($anchor);

      return ~~top <= 0 && ~~bottom > 0;
    });

    return anchor;
  }

  anchorScrolling(anchor) {
    const { $link, $anchor } = anchor;
    if (!this._isPathnameCorrect($link) || this._$currentLink === $link) {
      return;
    }
    if ($anchor) {
      window.removeEventListener('scroll', this._scrollListener);
      this.anchorActive(anchor);
      if (typeof this._handler === 'function') {
        this._handler($link, $anchor);
      }
    }
  }

  anchorActive({ $anchor, $link, id }, smooth = true) {
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

    return { $anchor, $link, id };
  }

  _scrolling(id, $anchor) {
    const { top } = this._distance($anchor);
    window.scrollBy({
      behavior: 'smooth',
      left: 0,
      top
    });

    const checkIfDone = setInterval(() => {
      const { top } = this._distance($anchor);
      if (~~top === 0 || this._atBottom()) {
        this._history(id, $anchor);
        window.addEventListener('scroll', this._scrollListener);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  _history(id, $anchor) {
    $anchor.focus();
    // window.history.pushState('', '', id);
  }

  _distance($anchor) {
    let { top, bottom } = $anchor.getBoundingClientRect();

    if (this._navbarHeight > 0) {
      if (top !== 0) {
        top -= this._navbarHeight;
      }
      if (bottom !== 0) {
        bottom -= this._navbarHeight;
      }
    }

    return {
      top: top,
      bottom: bottom
    };
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
