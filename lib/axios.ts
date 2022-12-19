import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(
  requestConfig => {
    if (axios.getUri(requestConfig).includes(process.env.BRIDGE_URL as string)) {
      // Cancel bridge axios requests unless...
      if (process.env.NODE_ENV !== 'development') return requestConfig;
      if (requestConfig.method === 'get' || requestConfig.method === 'GET') return requestConfig;
      if (axios.getUri(requestConfig).includes(process.env.AUTH_URL as string))
        return requestConfig;

      throw new axios.Cancel(
        `Not sending '${requestConfig.method}' requests to Bridge production during development.`
      );
    }

    return requestConfig;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;
