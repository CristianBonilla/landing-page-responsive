import 'bootstrap/js/dist/button';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';

import Glider from 'glider-js';

import testimonials from '@services/posts-service';

function autoPlay(slider, miliseconds) {
  slider.isLastSlide = () => slider.page >= slider.dots.childElementCount - 1;
  const slide = () => {
    slider.slideTimeout = setTimeout(() => {
      const slideTo = () => slider.isLastSlide() ? 0 : slider.page + 1;
      slider.scrollItem(slideTo(), true);
    }, miliseconds);
  }
  slider.ele.addEventListener('glider-animated', () => {
    window.clearInterval(slider.slideTimeout);
    slide();
  });

  slide();
}

const instance = testimonials.getSingleton;
const postsList = instance.postsList();

function getRandom(array, max) {
  const arrayResult = new Array(max);
  let length = array.length;
  const arrayToken = new Array(length);
  if (max > length) {
    throw new RangeError('getRandom: more elements taken than available');
  }
  while (max--) {
    const random = Math.floor(Math.random() * length);
    arrayResult[max] = array[random in arrayToken ? arrayToken[random] : random];
    arrayToken[random] = --length in arrayToken ? arrayToken[length] : length;
  }

  return arrayResult;
}

const testimonialsTemplate = (name, detail, image) => `
  <div class="container-fluid">
    <div class="d-flex flex-column justify-content-center align-items-center">
      <img class="testimonials-image img-fluid rounded-circle" src="${ image }">
      <div class="w-sm-75 w-md-50">
        <p class="testimonials-detail">"${ detail }"</p>
        <h6 class="testimonials-name">${ name }</h6>
      </div>
    </div>
  </div>
`;

const photos = [
  'assets/images/person_2.jpg',
  'assets/images/person_3.jpg',
  'assets/images/person_4.jpg'
];

const iterateElement = document.querySelector('[data-iterate]');

postsList.then(posts => {
  const postsMapper = posts.map(u => {
    const photoRandom = getRandom(photos, 1)[0];

    return testimonialsTemplate(
      u.title,
      u.body,
      photoRandom);
  });
  const postsRandom = getRandom(postsMapper, 20);
  postsRandom.forEach(p =>
    iterateElement.insertAdjacentHTML('beforeend', p));
}).finally(() => {
  const carouselElement = document.querySelector('.testimonials-carousel');
  const glider = new Glider(carouselElement, {
    slidesToShow: 1,
    scrollLock: true,
    dots: '#dots'
  });
  autoPlay(glider, 5000);
});
