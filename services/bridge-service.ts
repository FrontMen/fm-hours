import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  getMe() {
    return this.axios
      .$get<{bridgeUid: string}>('/api/bridge/me')
      .then(({bridgeUid}) => bridgeUid);
  }
}
