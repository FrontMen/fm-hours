import { format } from "date-fns";

import { NuxtAxiosInstance } from "@nuxtjs/axios";

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;
  ApiUrl = "/api/v1";

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getWorkScheme(params: {
    bridgeUid: string;
    startDate: Date;
    endDate: Date;
  }) {
    const { bridgeUid, startDate, endDate } = params;

    try {
      const response = await this.axios.$get<WorkSchemeResponse>(
        `${this.ApiUrl}/users/${bridgeUid}/worktime?date_from=${format(
          startDate,
          "yyyy-MM-dd"
        )}&date_to=${format(endDate, "yyyy-MM-dd")}`,
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
        holiday: ws.holiday,
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API error", error);
    }
  }
}
