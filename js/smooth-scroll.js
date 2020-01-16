export class Scrolling {
  constructor($links) {
    this._$links = [...$links];
  }

  apply() {
    const linkListener = this.listener.bind(this);
    this._$links.forEach(l => l.addEventListener('click', linkListener));
    const currentLink = this._$links.find(l => l.href === location.href);
    if (currentLink) {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      setTimeout(() => currentLink.dispatchEvent(event));
    }
  }

  listener(event, respond = null) {
    event.preventDefault();
    const $element = event.currentTarget;
    if (this.isPathnameCorrect($element)) {
      const idElement = respond ? respond.getAttribute('href') : $element.getAttribute('href');
      const $anchorElement = document.querySelector(idElement);
      if ($anchorElement) {
        this.scrolling($anchorElement, idElement);
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
