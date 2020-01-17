import Glide from './glide.esm.js';

const { ...axiosObject } = axios;
const { ...rxjsObject } = rxjs;
const imagesFunction = imagesLoaded;

export {
  axiosObject as axios,
  imagesFunction as imagesLoaded,
  Glide,
  rxjsObject as rxjs
};
