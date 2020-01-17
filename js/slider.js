import { imagesLoaded, Glide, rxjs } from './vendor/index.js';

const { empty, from, iif, of, range } = rxjs;
const { concatMapTo, defaultIfEmpty, mergeMap, reduce } = rxjs.operators;

export class Slider {
  _sliderOptionsDefault = {
    type: 'carousel',
    autoplay: 5000,
    hoverpause: false,
    gap: 0,
    perView: 1,
    rewindDuration: 1000,
    animationDuration: 1000
  };

  constructor(selector, sliderOptions = { }) {
    this._selector = selector;
    this._sliderOptions = sliderOptions;
    this._element = document.querySelector(selector);
  }

  static sliderAutoHeight(Glide, { Html }, events) {
    const extend = {
      mount() {
        Html.track.style.transition = 'height .2s ease-in-out';
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

  applySlider(items, includeBullets) {
    const slider = this.sliderTemplate(items, includeBullets).pipe(
      mergeMap(t => {
        this._element.innerHTML = t;

        return this.sliderInstance();
      }),
      defaultIfEmpty(null));

    return slider;
  }

  sliderInstance() {
    const instance = new Glide(`${ this._selector }>.glide`, {
      ...this._sliderOptionsDefault,
      ...this._sliderOptions
    });

    return of(instance);
  }

  sliderTemplate(items, includeBullets) {
    const bullets = includeBullets ? items.length : 0;
    const template = this.trackSliderTemplate(items).pipe(
      concatMapTo(
        this.bulletsSliderTemplate(bullets), (t, b) => t + b),
      mergeMap(t =>
        iif(() => !t.length, empty(), of(`<div class="glide">${ t }</div>`))));

    return template;
  }

  trackSliderTemplate(items) {
    const trackTemplate = from(items).pipe(
      reduce((a, c) =>
        a + `<li class="glide__slide">${ c }</li>`, ''),
      mergeMap(t =>
        of(!t.length ? '' : `
          <div class="glide__track" data-glide-el="track">
            <ul class="glide__slides">${ t }</ul>
          </div>`)));

    return trackTemplate;
  }

  bulletsSliderTemplate(amount) {
    const bulletTemplate = range(0, amount).pipe(
      reduce((a, c) =>
        a + `<button class="glide__bullet" data-glide-dir="${ c }"></button>`, ''),
      mergeMap(t =>
        of(!t.length ? '' :
          `<div class="glide__bullets" data-glide-el="controls[nav]">${ t }</div>`)));

    return bulletTemplate;
  }
}
