// DOM Interaction

import { NavigationToggle } from './navigationToggle.js';
import { SmoothScroll } from './smoothScroll.js';
import { prototypesImages, aboutImages } from './imagePaths.js';
import { Carousel } from './carousel.js';
import DOManimation from './animate.js';
import testimonials$ from './testimonials.js';

const $toggler = document.getElementById('navigation_toggler');
const $content = document.querySelector('.navigation_content');
const $menu = $content.querySelector('.navigation_menu');
const $links = $menu.querySelectorAll('li>a');
const $mainLink = document.getElementById('navigation_title');

const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new NavigationToggle($toggler, $content, mediaQuery);
const toggleMount = toggle.mount();

const scrolling = new SmoothScroll($mainLink, $links, toggleMount.navbarHeight());
const scrollingMount = scrolling.mount();

scrollingMount.handler = () => {
  if (toggleMount.isVisible) {
    toggleMount.hide();
  }
};

toggleMount.handler = () => {
  scrollingMount.navbarHeight = toggleMount.navbarHeight();
};

// DOM Animations

const $titles = document.querySelectorAll('.animate_title');
const $home = document.querySelector('.home');
const $intro = $home.querySelector('.home_intro');
const $image = $home.querySelector('.home_image');

DOManimation({
  $elements: $menu,
  animationName: 'slide',
  mediaQuery: window.matchMedia('(min-width: 576px)')
}, {
  $elements: [ ...$titles ],
  animationName: 'rubber',
  loop: true
}, {
  $elements: $intro,
  animationName: 'outBox'
}, {
  $elements: $image,
  animationName: 'zoom'
}).subscribe(_ => {
  const { initialScrollY } = scrolling;
  const scrollY = window.scrollY;
  if (scrollY !== initialScrollY) {
    window.scrollTo(0, initialScrollY);
  }
});

// Carousel

// const carouselAutoHeight = Carousel.setAutoHeight;

const prototypesImagesTemplate = prototypesImages.map(path => `
  <figure class="prototypes_image">
    <img src="${ path }" alt="">
  </figure>`);
const prototypesCarousel = new Carousel('.prototypes .prototypes_carousel');
const prototypes$ = prototypesCarousel.mount(prototypesImagesTemplate, false /* { carouselAutoHeight } */);

const aboutImagesTemplate = aboutImages.map(path => `
  <figure class="about-us_image">
    <img src="${ path }" alt="">
  </figure>`);
const aboutCarousel = new Carousel('.about-us .about-us_carousel');
const about$ = aboutCarousel.mount(aboutImagesTemplate, false  /* { carouselAutoHeight } */);

const { zip } = rxjs;

zip(
  prototypes$,
  about$,
  testimonials$)
  .subscribe();
