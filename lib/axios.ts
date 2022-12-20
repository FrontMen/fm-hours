import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(
  requestConfig => {
    const uri = axios.getUri(requestConfig);
    const isDev = process.env.NODE_ENV === 'development';
    const isGet = requestConfig.method?.toLowerCase() === 'get';
    const isBridgeUrl = uri.includes(process.env.BRIDGE_URL as string);
    const isAuthUrl = uri.includes(process.env.AUTH_URL as string);

    if (isDev && isGet && isBridgeUrl && !isAuthUrl) {
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
