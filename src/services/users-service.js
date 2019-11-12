import { ServiceFactory, HttpGetContext, Api } from '@services/service-factory';

export default {
  instance: null,
  get getSingleton() {
    if (!this.instance) {
      const serviceFactoryInstance = new ServiceFactory(Api.users);
      this.instance = {
        usersList: async () => {
          const users = await serviceFactoryInstance.get('/', HttpGetContext.get);

          return users;
        }
      }
    }

    return this.instance;
  }
};
