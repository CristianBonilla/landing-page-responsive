import { Toggle } from './navigation-toggle.js';
import { Scrolling } from './smooth-scroll.js';
import { prototypes, about } from './images.js';
import { Slider } from './slider.js';

const $toggler = document.getElementById('navigation_toggler');
const $menuContent = document.querySelector('.navigation_content');
const $mainLink = document.getElementById('navigation_title');
const $links = $menuContent.querySelectorAll('ul>li>a');
const mediaQuery = window.matchMedia('(max-width: 575px)');

const toggle = new Toggle($toggler, $menuContent, mediaQuery);
toggle.apply();
const scrolling = new Scrolling($mainLink, $links);
scrolling.apply(() => {
  if (toggle.isVisible) {
    toggle.hide();
  }
});

const sliderAutoHeight = Slider.sliderAutoHeight;

const prototypesTemplate = prototypes.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesSlider = new Slider('.prototypes .prototypes_slider');
const prototypesSubscription = prototypesSlider.applySlider(prototypesTemplate)
  .subscribe(slider => {
    if (slider) {
      slider.mount({ sliderAutoHeight });
    }
  });

const aboutTemplate = about.map(a => `
  <figure class="about-us_image">
    <img src="${ a }" alt="">
  </figure>`);
const aboutSlider = new Slider('.about-us .about-us_slider');
const aboutSubscription = aboutSlider.applySlider(aboutTemplate)
  .subscribe(slider => {
    if (slider) {
      slider.mount({ sliderAutoHeight });
    }
  });

function* subscriptions() {
  yield prototypesSubscription;
  yield aboutSubscription;
}

for (const subscription of subscriptions()) {
  subscription.unsubscribe();
}
