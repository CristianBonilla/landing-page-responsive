import { ServiceFactory, HttpGetContext, Api } from '@services/service-factory';

export default {
  instance: null,
  get getSingleton() {
    if (!this.instance) {
      const serviceFactoryInstance = new ServiceFactory(Api.posts);
      this.instance = {
        postsList: async () => {
          const posts = await serviceFactoryInstance.get('/', HttpGetContext.get);

          return posts;
        }
      }
    }

    return this.instance;
  }
};
