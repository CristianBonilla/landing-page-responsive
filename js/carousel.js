import Glide from '../vendor/glide.esm.js';

const { empty, from, iif, of, range } = rxjs;
const { concatMapTo, defaultIfEmpty, mergeMap, reduce } = rxjs.operators;

export class Carousel {
  // Experimental class-fields
  // _carouselOptionsDefault = {
  //   type: 'carousel',
  //   autoplay: 5000,
  //   hoverpause: false,
  //   gap: 0,
  //   perView: 1,
  //   rewindDuration: 1000,
  //   animationDuration: 1000
  // };

  constructor(selector, carouselOptions = { }) {
    this._selector = selector;
    this._$element = document.querySelector(this._selector);
    this._carouselOptions = carouselOptions;
    this._carouselOptionsDefault = {
      animationDuration: 1000,
      autoplay: 5000,
      dragThreshold: 120,
      gap: 0,
      hoverpause: false,
      perView: 1,
      rewindDuration: 1000,
      swipeThreshold: 80,
      type: 'carousel'
    };
  }

  static setAutoHeight(Glide, { Html }, events) {
    const extend = {
      mount() {
        Html.track.classList.add('auto-height');
        imagesLoaded(Html.track, this.set);
      },
      set() {
        const slide = Html.slides[Glide.index];
        const height = slide.offsetHeight;
        Html.track.style.height = `${ height }px`;
      }
    };
    events.on([ 'run', 'resize' ], extend.set);

    return extend;
  }

  mount(items, includeBullets, modules = { }) {
    const carousel = this._carouselTemplate(items, includeBullets)
      .pipe(
        mergeMap(t => {
          this._$element.innerHTML = t;

          return this._carouselInstance(modules);
        }),
        defaultIfEmpty(null));

    return carousel;
  }

  _carouselInstance(modules) {
    const selector = `${ this._selector }>.glide`;
    const options = {
      ...this._carouselOptionsDefault,
      ...this._carouselOptions
    }
    const carousel = new Glide(selector, options);
    carousel.mount(modules);

    const { dragThreshold, swipeThreshold } = options;
    if (!dragThreshold || !swipeThreshold) {
      document.querySelector(selector)
        .classList.add('glide--not--draggable');
    }

    return of(carousel);
  }

  _carouselTemplate(items, includeBullets) {
    const bulletsAmount = includeBullets ? items.length : 0;
    const template = this._trackCarouselTemplate(items)
      .pipe(
        concatMapTo(
          this._bulletsCarouselTemplate(bulletsAmount),
          (t, b) => t + b),
        mergeMap(t =>
          iif(() => !t.length, empty(), of(`<div class="glide">${ t }</div>`))));

    return template;
  }

  _trackCarouselTemplate(items) {
    const trackTemplate = from(items)
      .pipe(
        reduce((a, c) =>
          a + `<li class="glide__slide">${ c }</li>`, ''),
        mergeMap(t =>
          of(!t.length ? '' : `
            <div class="glide__track" data-glide-el="track">
              <ul class="glide__slides">${ t }</ul>
            </div>`)));

    return trackTemplate;
  }

  _bulletsCarouselTemplate(amount) {
    const bulletTemplate = range(0, amount)
      .pipe(
        reduce((a, c) =>
          a + `<button class="glide__bullet" data-glide-dir="=${ c }"></button>`, ''),
        mergeMap(t =>
          of(!t.length ? '' :
            `<div class="glide__bullets" data-glide-el="controls[nav]">${ t }</div>`)));

    return bulletTemplate;
  }
}
