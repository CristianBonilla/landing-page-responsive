// DOM interaction
import { Toggle } from './navigation-toggle.js';
import { Scrolling } from './smooth-scroll.js';
import { prototypes, about } from './images.js';
import { Carousel } from './carousel.js';
import animate from './animate.js';

const $toggler = document.getElementById('navigation_toggler');
const $content = document.querySelector('.navigation_content');
const $menu = $content.querySelector('.navigation_menu');
const $links = $menu.querySelectorAll('li>a');
const $mainLink = document.getElementById('navigation_title');

const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new Toggle($toggler, $content, mediaQuery);
toggle.mount();
const scrolling = new Scrolling($mainLink, $links, toggle.navbarHeight());
scrolling.mount();

scrolling.handler = () => {
  if (toggle.isVisible) {
    toggle.hide();
  }
};
toggle.handler = () => scrolling.navbarHeight = toggle.navbarHeight();

// const carouselAutoHeight = Carousel.setAutoHeight;

const prototypesTemplate = prototypes.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesCarousel = new Carousel('.prototypes .prototypes_carousel');
const prototypesSubscription = prototypesCarousel.mount(prototypesTemplate)
  .subscribe(carousel => {
    if (carousel) {
      carousel.mount(/* { carouselAutoHeight } */);
    }
  });

const aboutTemplate = about.map(a => `
  <figure class="about-us_image">
    <img src="${ a }" alt="">
  </figure>`);
const aboutCarousel = new Carousel('.about-us .about-us_carousel');
const aboutSubscription = aboutCarousel.mount(aboutTemplate)
  .subscribe(carousel => {
    if (carousel) {
      carousel.mount(/* { carouselAutoHeight } */);
    }
  });

// DOM animations

const $titles = document.querySelectorAll('.animate_title');
const $home = document.querySelector('.home');
const $intro = $home.querySelector('.home_intro');
const $image = $home.querySelector('.home_image');

animate({
  $el: $menu,
  name: 'slide'
}, {
  $el: [ ...$titles ],
  name: 'rubber',
  loop: true
}, {
  $el: $intro,
  name: 'outBox'
}, {
  $el: $image,
  name: 'zoom'
});

function* subscriptions() {
  yield prototypesSubscription;
  yield aboutSubscription;
}

for (const subscription of subscriptions()) {
  subscription.unsubscribe();
}
