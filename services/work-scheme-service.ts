import {format} from 'date-fns';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getWorkScheme(params: {
    bridgeUid: string;
    startDate: Date;
    endDate: Date;
  }): Promise<WorkScheme[]> {
    const {bridgeUid, startDate, endDate} = params;

    const path = `/api/bridge/workscheme/${bridgeUid}`;
    const {data} = await this.axios.$get<WorkSchemeResponse>(path, {
      params: {
        date_from: format(startDate, 'yyyy-MM-dd'),
        date_to: format(endDate, 'yyyy-MM-dd'),
      },
    });
    return data;
  }
}
