import {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class mailService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  url = 'https://us-central1-fm-hours.cloudfunctions.net/sendMail';

  async sendMail(params: EmailData) {
    try {
      await this.axios.post(this.url, params);
    } catch (err) {
      console.error('An error happened while trying to send the e-mail', err);
    }
  }
}
