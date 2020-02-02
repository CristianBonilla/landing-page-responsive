// DOM interaction
import { Toggle } from './navigation-toggle.js';
import { Scrolling } from './smooth-scroll.js';
import { prototypes, about } from './images.js';
import { Carousel } from './carousel.js';

const $toggler = document.getElementById('navigation_toggler');
const $menuContent = document.querySelector('.navigation_content');
const $links = $menuContent.querySelectorAll('ul>li>a');
const $mainLink = document.getElementById('navigation_title');

const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new Toggle($toggler, $menuContent, mediaQuery);
toggle.mount();

const scrolling = new Scrolling($mainLink, $links, toggle.navbarHeight);
scrolling.mount();

scrolling.handler = () => {
  if (toggle.isVisible) {
    toggle.hide();
  }
};
toggle.handler = () => scrolling.navbarHeight = toggle.navbarHeight;

const carouselAutoHeight = Carousel.setAutoHeight;

const prototypesTemplate = prototypes.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesCarousel = new Carousel('.prototypes .prototypes_carousel');
const prototypesSubscription = prototypesCarousel.mount(prototypesTemplate)
  .subscribe(carousel => {
    if (carousel) {
      carousel.mount({ carouselAutoHeight });
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
      carousel.mount({ carouselAutoHeight });
    }
  });

function* subscriptions() {
  yield prototypesSubscription;
  yield aboutSubscription;
}

for (const subscription of subscriptions()) {
  subscription.unsubscribe();
}
