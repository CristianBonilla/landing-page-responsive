import { Toggle } from './navigation-toggle.js';
import { Scrolling } from './smooth-scroll.js';
import { prototypes, about } from './images.js';
import { Carousel } from './carousel.js';

const $toggler = document.getElementById('navigation_toggler');
const $menuContent = document.querySelector('.navigation_content');
const $mainLink = document.getElementById('navigation_title');
const $links = $menuContent.querySelectorAll('ul>li>a');

const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new Toggle($toggler, $menuContent, mediaQuery);
toggle.mount();
const scrolling = new Scrolling($mainLink, ...$links);
scrolling.mount(() => {
  if (toggle.isVisible) {
    toggle.hide();
  }
});

const carouselAutoHeight = Carousel.carouselAutoHeight;

const prototypesTemplate = prototypes.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesCarousel = new Carousel('.prototypes .prototypes_carousel');
const prototypesSubscription = prototypesCarousel.applyCarousel(prototypesTemplate)
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
const aboutSubscription = aboutCarousel.applyCarousel(aboutTemplate)
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
