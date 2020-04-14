class Scrolling {
  _$currentLink = null;
  _handler = null;
  _scrollListener = _ => this.anchorCurrentPosition(false);

  constructor($mainLink, $links, navbarHeight) {
    this.$mainLink = $mainLink;
    this.anchors = $links.map($link => this.anchor($link));
    this._navbarHeight = navbarHeight;
  }

  get scrollListener() {
    return this._scrollListener;
  }

  get navbarHeight() {
    return this._navbarHeight;
  }

  set navbarHeight(navHeight) {
    this._navbarHeight = navHeight;
  }

  get handler() {
    return this._handler;
  }

  set handler(handler) {
    this._handler = handler;
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

  anchorCurrentPosition(smooth = true) {
    const anchor = this.anchorScrollingPosition();
    if (anchor && anchor.$link !== this._$currentLink) {
      this.anchorActive(anchor, smooth);
    }
  }

  anchorScrollingPosition() {
    const anchor = this.anchors.find(({ $anchor }) => {
      const { top, bottom } = this.distance($anchor);

      return ~~top <= 0 && ~~bottom > 0;
    });

    return anchor;
  }


  anchorScrolling(anchor) {
    const { $link, $anchor } = anchor;

    if (!this.isPathnameCorrect($link) || this._$currentLink === $link) {
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
      this.scrolling(id, $anchor);
    } else {
      this.history(id, $anchor);
    }
  }

  anchorByHref(href) {
    const anchor = this.anchors.find(({ $link }) => $link.href === href);

    return anchor;
  }

  anchor($link) {
    const id = $link.getAttribute('href');
    const $anchor = document.querySelector(id);

    return { $anchor, $link, id };
  }

  scrolling(id, $anchor) {
    const { top } = this.distance($anchor);
    window.scrollBy({
      behavior: 'smooth',
      left: 0,
      top
    });

    const checkIfDone = setInterval(() => {
      const { top } = this.distance($anchor);

      if (~~top === 0 || this.atBottom()) {
        this.history(id, $anchor);
        window.addEventListener('scroll', this._scrollListener);
        clearInterval(checkIfDone);
      }
    }, 100);
  }

  history(id, $anchor) {
    $anchor.focus();
    // window.history.pushState('', '', id);
  }

  distance($anchor) {
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
      top,
      bottom
    };
  }

  atBottom() {
    return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
  }

  isPathnameCorrect($link) {
    const hasHref = $link.href && $link.href.indexOf('#') >= 0;
    const pathname = location.pathname;
    const equalPathname = $link.pathname === pathname || ('/' + $link.pathname) === pathname;
    const equalSearch = $link.search === location.search;

    return hasHref && equalPathname && equalSearch;
  }
}

export class SmoothScroll {
  _initialScrollY = 0;

  constructor($mainLink, [ ...$links ], navbarHeight = 0) {
    this._factory = new Scrolling($mainLink, $links, navbarHeight);
    this.$mainLink = $mainLink;
  }

  get initialScrollY() {
    return this._initialScrollY;
  }

  mount() {
    this.$mainLink.addEventListener('click', event => {
      event.preventDefault();

      if (window.scrollY === 0) {
        return;
      }
      window.scrollTo({
        behavior: 'smooth',
        left: 0,
        top: 0
      });
      if (typeof this._factory.handler === 'function') {
        this._factory.handler(this.$mainLink, null);
      }
    });

    const anchors = this._factory.anchors;
    for (const anchor of anchors) {
      anchor.$link.addEventListener('click', event => {
        event.preventDefault();
        this._factory.anchorScrolling(anchor);
      });
    }

    const anchor = this._factory.anchorByHref(location.href);
    if (anchor) {
      this._factory.anchorScrolling(anchor);
    } else {
      this._factory.anchorCurrentPosition(false);
    }

    this._initialScrollY = window.scrollY;
    window.addEventListener('scroll', this._factory.scrollListener);

    return this._factory;
  }
}
