import Glide from './glide.esm.js';

const { ...axiosObject } = axios;
const { from, operators } = rxjs;

export default {
  axios: axiosObject,
  rxjs: {
    from,
    operators
  },
  Glide,
  imagesLoaded
};
