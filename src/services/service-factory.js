import axios from 'axios';
import { environments } from '@/environments/environments';

export const Api = Object.freeze({
  posts: 'POSTS',
  users: 'USERS'
});

export const HttpGetContext = Object.freeze({
  head: 'HEAD',
  delete: 'DELETE',
  get: 'GET'
});

export const HttpSetContext = Object.freeze({
  patch: 'PATCH',
  put: 'PUT',
  post: 'POST'
});

export class ServiceFactory {
  constructor(api) {
    switch (api) {
      case Api.users:
        this.API_URL = environments.urlApi.users;
        break;
      default:
        this.API_URL = environments.urlApi.posts;
        break;
    }
    this.http = axios.create(this.configDefault);
  }

  get configDefault() {
    const config = {
      baseURL: this.API_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      responseType: 'json'
    }

    return config;
  }

  async get(contextUrl, method, params = { }) {
    let promiseType;
    switch (method) {
      case HttpGetContext.head: {
        promiseType = this.http.head;
        break;
      }
      case HttpGetContext.delete: {
        promiseType = this.http.delete;
        break;
      }
      default: {
        promiseType = this.http.get;
        break;
      }
    }
    const sendRequest = await this.sendRequest(promiseType, contextUrl, {
      params
    });

    return sendRequest;
  }

  async set(contextUrl, method, data) {
    let promiseType;
    switch (method) {
      case HttpSetContext.patch: {
        promiseType = this.http.patch;
        break;
      }
      case HttpSetContext.post: {
        promiseType = this.http.post;
        break;
      }
      default: {
        promiseType = this.http.put;
        break;
      }
    }
    const sendRequest = await this.sendRequest(promiseType, contextUrl, data);

    return sendRequest;
  }

  async sendRequest(promiseType, ...args) {
    try {
      const responseData = await promiseType(...args);
      const { data } = responseData;

      return data;
    } catch (error) {
      let errorMessage;
      if (error instanceof Error) {
        const objError = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
        errorMessage = JSON.stringify(objError, null, 2);
      } else {
        errorMessage = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
      }

      throw new Error(`La solicitud respondio con el siguiente error:\n${ errorMessage }`);
    }
  }
}
