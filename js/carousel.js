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

  _bulletsTemplate = {
    bullet: '<button class="glide__bullet" data-glide-dir="=|index|"></button>',
    bullets: '<div class="glide__bullets" data-glide-el="controls[nav]">|bullets|</div>'
  };

  _trackTemplate = {
    slide: '<li class="glide__slide">|item|</li>',
    track: `
      <div class="glide__track" data-glide-el="track">
        <ul class="glide__slides">|slides|</ul>
      </div>`
  };

  _template = '<div class="glide">|content|</div>';

  constructor(selector, carouselOptions = { }) {
    this.selector = selector;
    this.$element = document.querySelector(this.selector);
    this.carouselOptions = carouselOptions;
  }

  mount(items, includeBullets, modules = { }) {
    const carousel$ = this.carouselTemplate(items, includeBullets)
      .pipe(
        mergeMap(html => {
          this.$element.innerHTML = html;

          return this.carousel(modules, includeBullets);
        }),
        defaultIfEmpty(null));

    return carousel$;
  }

  carousel(modules, includeBullets) {
    const selector = `${ this.selector }>.glide`;
    const options = {
      ...this._carouselOptionsDefault,
      ...this.carouselOptions
    };

    const carousel = new Glide(selector, options);
    const carouselMount = carousel.mount({
      ...modules,
      ...(includeBullets ? { bulletActive: this._bulletActive } : { })
    });

    const { dragThreshold, swipeThreshold } = options;
    if (!dragThreshold || !swipeThreshold) {
      document.querySelector(selector)
        .classList.add('glide--not--draggable');
    }

    return of(carouselMount);
  }

  carouselTemplate(items, includeBullets) {
    const bulletsAmount = includeBullets ? items.length : 0;
    const template$ = this.trackCarouselTemplate(items)
      .pipe(
        concatMapTo(
          this.bulletsCarouselTemplate(bulletsAmount),
          (content, bullets) => content + bullets),
        mergeMap(content => {
          const html = !content.length ? empty() : of(this._template.replace('|content|', content));

          return html;
        }));

    return template$;
  }

  trackCarouselTemplate(items) {
    const { slide, track } = this._trackTemplate;
    const trackTemplate$ = from(items)
      .pipe(
        reduce((slides, item) =>
          slides + slide.replace('|item|', item), ''),
        mergeMap(slides => {
          const html = !slides.length ? '' : track.replace('|slides|', slides);

          return of(html);
        }));

    return trackTemplate$;
  }

  bulletsCarouselTemplate(bulletsAmount) {
    const { bullet, bullets } = this._bulletsTemplate;
    const bulletsTemplate$ = range(0, bulletsAmount)
      .pipe(
        reduce((bulletButton, index) =>
          bulletButton + bullet.replace('|index|', index), ''),
        mergeMap(bulletButton => {
          const html = !bulletButton.length ? '' : bullets.replace('|bullets|', bulletButton);

          return of(html);
        }));

    return bulletsTemplate$;
  }

  _bulletActive(Glide, { Html }, events) {
    const extend = {
      bulletActive: 'glide__bullet--active',
      bullets: null,
      index: 0,
      previousIndex: -1,
      mount() {
        this.bullets = Html.root.querySelector('.glide__bullets').children;
      }
    };

    events.on('run.before', _ => {
      extend.previousIndex = Glide.index;
    });

    events.on([ 'mount.after', 'run' ], _ => {
      extend.index = Glide.index;
      const { bulletActive, bullets, previousIndex, index } = extend;
      if (previousIndex >= 0 && index >= 0) {
        const previousBullet = bullets.item(previousIndex);
        const bullet = bullets.item(index);

        previousBullet.classList.remove(bulletActive);
        bullet.classList.add(bulletActive);
      }
    });

    return extend;
  }
}
