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

// Testimonials

const { empty, from, of, zip } = rxjs;
const { fromFetch } = rxjs.fetch;
const { distinct, expand, filter, find, last, map, max, mergeAll, min } = rxjs.operators;
const { pluck, switchMap, toArray, withLatestFrom } = rxjs.operators;

const seenPosts = 3;

function random(minimum, amount) {
  return Math.floor(Math.random() * amount) + minimum;
}

function randomNumbers([ min, max ]) {
  const numbers = of([])
    .pipe(
      expand(n => n.length === seenPosts ? empty() :
        from(Array(seenPosts))
          .pipe(
            map(_ => random(min, max)),
            distinct(),
            toArray())),
      last(),
      mergeAll());

  return numbers;
}

function randomIndexes(posts) {
  const fromPosts = from(posts);
  const order = (a, b) => a.id < b.id ? -1 : 1;

  const indexes = fromPosts
    .pipe(
      min(order),
      withLatestFrom(fromPosts
        .pipe(
          max(order))),
      mergeAll(),
      pluck('id'),
      toArray(),
      switchMap(r => randomNumbers(r)));

  return indexes;
}

function takePosts(posts) {
  const take = randomIndexes(posts)
    .pipe(
      switchMap(i => from(posts)
        .pipe(
          find(({ id }) => id === i))),
      toArray());

  return take;
}

function postsByUserId(id, posts) {
  const findPosts = from(posts)
    .pipe(
      filter(({ userId }) => userId === id),
      toArray());

  return findPosts;
}

function usersByPosts(users, posts) {
  const findUsers = from(posts)
    .pipe(
      distinct(({ userId }) => userId),
      switchMap(({ userId }) => from(users)
        .pipe(
          find(({ id }) => id === userId))));

  return findUsers;
}

function groupByUsers(users, posts) {
  const group = usersByPosts(users, posts)
    .pipe(
      switchMap(u => zip(
        of(u),
        postsByUserId(u.id, posts))));

  return group;
}

const posts = fromFetch('https://jsonplaceholder.typicode.com/posts')
  .pipe(
    switchMap(response => response.json()));
const users = fromFetch('https://jsonplaceholder.typicode.com/users')
  .pipe(
    switchMap(response => response.json()));

zip(users, posts)
  .pipe(
    switchMap(([ u, p ]) => takePosts(p)
      .pipe(
        switchMap(p => groupByUsers(u, p)))))
  .subscribe(console.log);

function* subscriptions() {
  yield prototypesSubscription;
  yield aboutSubscription;
}

for (const subscription of subscriptions()) {
  subscription.unsubscribe();
}
