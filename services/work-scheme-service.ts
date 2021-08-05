import {format} from 'date-fns';

import {NuxtRuntimeConfig} from '@nuxt/types/config/runtime';
import {NuxtAxiosInstance} from '@nuxtjs/axios';
import ApiUrl from '~/helpers/api';

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;
  config: NuxtRuntimeConfig;

  constructor(axios: NuxtAxiosInstance, config: NuxtRuntimeConfig) {
    this.axios = axios;
    this.config = config;
  }

  async getWorkScheme(params: {
    bridgeUid: string;
    startDate: Date;
    endDate: Date;
  }): Promise<WorkScheme[] | undefined> {
    const {bridgeUid, startDate, endDate} = params;

    const response = await this.axios.$get<WorkSchemeResponse>(
      `${ApiUrl(this.config)}/users/${bridgeUid}/worktime?date_from=${format(
        startDate,
        'yyyy-MM-dd'
      )}&date_to=${format(endDate, 'yyyy-MM-dd')}`,
      {
        withCredentials: true,
      }
    );

    /* map API response to expected format */
    return response.data.map((ws) => ({
      date: ws.date,
      theoreticalHours: ws.theoretical_hours,
      absenceHours: ws.absence_hours,
      workHours: ws.work_hours,
      holiday: !!ws.holiday,
    }));
  }
}
