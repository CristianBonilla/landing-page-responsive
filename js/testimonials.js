import { Carousel } from './carousel.js';
import { testimonialsImages } from './imagePaths.js';

const { empty, from, of, zip } = rxjs;
const { fromFetch } = rxjs.fetch;
const { distinct, expand, find, last, map, max, mergeAll, mergeMap, min, pluck } = rxjs.operators;
const { switchMap, take, toArray, withLatestFrom } = rxjs.operators;

const seenPosts = 4;

// const random = (minimum, maximum) => Math.floor(Math.random() * (maximum - minimum + 1) + minimum);

// function randomNumbers([ min, max ], length = max - min + 1) {
//   const numbers$ = of([])
//     .pipe(
//       expand(numbers => numbers.length === length ? empty() : defer(() => {
//         const randomValue = random(min, max);
//         if (!numbers.includes(randomValue)) {
//           numbers.push(randomValue);
//         }

//         return of(numbers);
//       })),
//       last(),
//       mergeAll());

//   return numbers$;
// }

const random = (minimum, maximum) => Math.floor(Math.random() * maximum) + minimum;

function randomNumbers([ min, max ], length = max) {
  const numbers$ = of([])
    .pipe(
      expand(numbers => numbers.length === length ?
        empty() :
        from(Array(length))
          .pipe(
            map(_ => random(min, max)),
            distinct(),
            toArray())),
      last(),
      mergeAll());

  return numbers$;
}

function randomIndexes(posts) {
  const fromPosts$ = from(posts);
  const compare = (postA, postB) => postA.id < postB.id ? -1 : 1;

  const indexes$ = fromPosts$
    .pipe(
      min(compare),
      withLatestFrom(fromPosts$
        .pipe(
          max(compare))),
      mergeAll(),
      pluck('id'),
      toArray(),
      mergeMap(range => randomNumbers(range, seenPosts)));

  return indexes$;
}

function takePosts(posts) {
  const take$ = randomIndexes(posts)
    .pipe(
      mergeMap(index => from(posts)
        .pipe(
          find(({ id }) => id === index))),
      toArray());

  return take$;
}

function usersByPosts(users, posts) {
  const usersBy$ = from(posts)
    .pipe(
      distinct(({ userId }) => userId),
      mergeMap(({ userId }) => from(users)
        .pipe(
          find(({ id }) => id === userId))),
      toArray());

  return usersBy$;
}

function group(users, posts) {
  const usersWithPosts$ = takePosts(posts)
    .pipe(
      mergeMap(posts => zip(
        usersByPosts(users, posts),
        of(posts))));

  return usersWithPosts$;
}

const userById = (users, userId) => users.find(({ id }) => id === userId);

function userWithPost(users, posts) {
  const join$ = from(posts)
    .pipe(
      map(post => [
        userById(users, post.userId),
        post
      ]));

  return join$;
}

function randomImagePaths() {
  const maxLength = testimonialsImages.length;
  const paths$ = randomNumbers([ 0, maxLength ])
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

  return paths$;
}

const testimonialsItemTemplate = `
  <div class="testimonials_item">
    <figure class="testimonials_image">
      <img src="|imagePath|" alt="">
    </figure>
    <blockquote>
      <p>
        <cite>"|body|"</cite>
      </p>
      <strong>|name|</strong>
    </blockquote>
  </div>`;

function itemsTemplate(users, posts) {
  const items$ = zip(
    userWithPost(users, posts),
    randomImagePaths())
    .pipe(
      map(([ [ { name }, { body } ], imagePath ]) => testimonialsItemTemplate
        .replace('|imagePath|', imagePath)
        .replace('|body|', body)
        .replace('|name|', name)
      ),
      toArray());

  return items$;
}

function buildTestimonials([ users, posts ]) {
  const build$ = group(users, posts)
    .pipe(
      mergeMap(([ users, posts ]) => itemsTemplate(users, posts)
        .pipe(
          mergeMap(items => {
            const selector = '.testimonials .testimonials_carousel';
            const carousel = new Carousel(selector, {
              dragThreshold: false,
              swipeThreshold: false
            });

            return carousel.mount(items, true);
          }))));

  return build$;
}

const users$ = fromFetch('https://jsonplaceholder.typicode.com/users')
  .pipe(
    switchMap(response => response.json()));
const posts$ = fromFetch('https://jsonplaceholder.typicode.com/posts')
  .pipe(
    switchMap(response => response.json()));

const testimonials$ = zip(users$, posts$)
  .pipe(
    mergeMap(buildTestimonials));

export default testimonials$;
