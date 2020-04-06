import Glide from '../vendor/glide.esm.js';

const { empty, from, of, range } = rxjs;
const { concatMapTo, defaultIfEmpty, mergeMap, reduce } = rxjs.operators;

export class Carousel {
  _carouselOptionsDefault = {
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

  constructor(selector, carouselOptions = { }) {
    this._selector = selector;
    this._$element = document.querySelector(this._selector);
    this._carouselOptions = carouselOptions;
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
        mergeMap(html => {
          this._$element.innerHTML = html;

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
          (content, bullets) => content + bullets),
        mergeMap(content => {
          const html = !content.length ? empty() : of(`<div class="glide">${ content }</div>`);

          return html;
        }));

    return template;
  }

  _trackCarouselTemplate(items) {
    const trackTemplate = from(items)
      .pipe(
        reduce((slides, item) =>
          slides + `<li class="glide__slide">${ item }</li>`, ''),
        mergeMap(slides => {
          const html = !slides.length ? '' : `
            <div class="glide__track" data-glide-el="track">
              <ul class="glide__slides">${ slides }</ul>
            </div>`;

          return of(html);
        }));

    return trackTemplate;
  }

  _bulletsCarouselTemplate(amount) {
    const bulletsTemplate = range(0, amount)
      .pipe(
        reduce((bullets, index) =>
          bullets + `<button class="glide__bullet" data-glide-dir="=${ index }"></button>`, ''),
        mergeMap(bullets => {
          const html = !bullets.length ? '' : `
            <div class="glide__bullets" data-glide-el="controls[nav]">${ bullets }</div>`;

          return of(html);
        }));

    return bulletsTemplate;
  }
}
