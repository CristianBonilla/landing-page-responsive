// DOM interaction
import { Toggle } from './navigationToggle.js';
import { Scrolling } from './smoothScroll.js';
import { prototypesImages, aboutImages, testimonialsImages } from './imagePaths.js';
import { Carousel } from './carousel.js';
import { animate } from './animate.js';

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

const prototypesTemplate = prototypesImages.map(p => `
  <figure class="prototypes_image">
    <img src="${ p }" alt="">
  </figure>`);
const prototypesCarousel = new Carousel('.prototypes .prototypes_carousel');
const prototypes = prototypesCarousel.mount(
  prototypesTemplate,
  false
  /* { carouselAutoHeight } */);

const aboutTemplate = aboutImages.map(a => `
  <figure class="about-us_image">
    <img src="${ a }" alt="">
  </figure>`);
const aboutCarousel = new Carousel('.about-us .about-us_carousel');
const about = aboutCarousel.mount(
  aboutTemplate,
  false
  /* { carouselAutoHeight } */);

// DOM animations

const $titles = document.querySelectorAll('.animate_title');
const $home = document.querySelector('.home');
const $intro = $home.querySelector('.home_intro');
const $image = $home.querySelector('.home_image');

animate({
  $el: $menu,
  name: 'slide',
  mediaQuery: window.matchMedia('(min-width: 576px)')
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
const { distinct, expand, find, last, map, max, mergeAll, min } = rxjs.operators;
const { pluck, switchMap, take, toArray, withLatestFrom } = rxjs.operators;

const seenPosts = 4;

function random(minimum, amount) {
  return Math.floor(Math.random() * amount) + minimum;
}

function randomNumbers([ min, max ], length = max) {
  const numbers = of([])
    .pipe(
      expand(n => n.length === length ? empty() :
        from(Array(length))
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
  const compare = (a, b) => a.id < b.id ? -1 : 1;

  const indexes = fromPosts
    .pipe(
      min(compare),
      withLatestFrom(fromPosts
        .pipe(
          max(compare))),
      mergeAll(),
      pluck('id'),
      toArray(),
      switchMap(range => randomNumbers(range, seenPosts)));

  return indexes;
}

function takePosts(posts) {
  const take = randomIndexes(posts)
    .pipe(
      switchMap(index => from(posts)
        .pipe(
          find(({ id }) => id === index))),
      toArray());

  return take;
}

function usersByPosts(users, posts) {
  const usersBy = from(posts)
    .pipe(
      distinct(({ userId }) => userId),
      switchMap(({ userId }) => from(users)
        .pipe(
          find(({ id }) => id === userId))),
      toArray());

  return usersBy;
}

function group(users, posts) {
  const usersWithPosts = takePosts(posts)
    .pipe(
      switchMap(posts => zip(
        usersByPosts(users, posts),
        of(posts))));

  return usersWithPosts;
}

function userById(users, userId) {
  return users.find(({ id }) => id === userId);
}

function postWithUser(users, posts) {
  const join = from(posts)
    .pipe(
      map(post => [
        userById(users, post.userId),
        post
      ]));

  return join;
}

function randomImagePaths() {
  const maxLength = testimonialsImages.length;
  const paths = randomNumbers([ 0, maxLength ])
    .pipe(
      toArray(),
      expand(numbers => {
        numbers.splice(numbers.length - 2, 0, numbers.shift());
        numbers.splice(numbers.length - 1, 0, numbers.pop());

        return of(numbers);
      }),
      mergeAll(),
      take(seenPosts),
      map(index => testimonialsImages[index]));

  return paths;
}

function itemsTemplate(users, posts) {
  const items = zip(
    postWithUser(users, posts),
    randomImagePaths())
    .pipe(
      map(([ [ { name }, { body } ], imagePath ]) => `
        <div class="testimonials_item">
          <figure class="testimonials_image">
            <img src="${ imagePath }" alt="">
          </figure>
          <blockquote>
            <p>
              <cite>"${ body }"</cite>
            </p>
            <strong>${ name }</strong>
          </blockquote>
        </div>`),
      toArray());

  return items;
}

function buildTestimonials([ users, posts ]) {
  const build = group(users, posts)
    .pipe(
      switchMap(([ users, posts ]) => itemsTemplate(users, posts)
        .pipe(
          switchMap(items => {
            const carousel = new Carousel('.testimonials .testimonials_carousel', {
              dragThreshold: false
            });

            return carousel.mount(items, true);
          }))));

  return build;
}

const posts = fromFetch('https://jsonplaceholder.typicode.com/posts')
  .pipe(
    switchMap(response => response.json()));
const users = fromFetch('https://jsonplaceholder.typicode.com/users')
  .pipe(
    switchMap(response => response.json()));

const testimonials = zip(users, posts)
  .pipe(
    switchMap(buildTestimonials));

zip(
  prototypes,
  about,
  testimonials)
  .subscribe();
