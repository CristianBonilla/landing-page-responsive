import libraries from './vendor/index.js';
import { Toggle } from './navigation-toggle.js';
import { Scrolling } from './smooth-scroll.js';
import { prototypes, about } from './images.js';

const $toggler = document.getElementById('navigation_toggler');
const $menuContent = document.querySelector('.navigation_content');
const $menuLinks = $menuContent.querySelectorAll('ul>li>a');
const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new Toggle($toggler, $menuContent, mediaQuery);
toggle.apply();
const scrolling = new Scrolling($menuLinks);
scrolling.apply();

const { Glide, imagesLoaded } = libraries;

const sliderOptionsDefault = {
  autoplay: 5000,
  hoverpause: false,
  gap: 0,
  perView: 1,
  rewindDuration: 1000,
  animationDuration: 1000
};

function sliderAutoHeight(Glide, { Html }, events) {
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

function applySlider(selector, items, options = { }) {
  const itemsTemplate = items.reduce((p, c) =>
    p + `<li class="glide__slide">${ c }</li>`, '');

  const sliderTemplate = `
  <div class="glide">
    <div class="glide__track" data-glide-el="track">
      <ul class="glide__slides">${ itemsTemplate }</ul>
    </div>
  </div>
  `;

  const element = document.querySelector(selector);
  element.innerHTML = sliderTemplate;

  const instance = new Glide(selector, {
    ...sliderOptionsDefault,
    ...options
  });

  return instance;
}

const prototypesTemplate = prototypes.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesSlider = applySlider(
  '.prototypes_slider',
  prototypesTemplate);
prototypesSlider.mount({ sliderAutoHeight });

const aboutTemplate = about.map(a => `
  <figure class="about-us_image">
    <img src="${ a }" alt="">
  </figure>`);
const aboutSlider = applySlider(
  '.about-us_slider',
  aboutTemplate);
aboutSlider.mount({ sliderAutoHeight });
