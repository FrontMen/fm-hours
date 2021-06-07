import { NuxtAxiosInstance } from "@nuxtjs/axios";
import { format } from "date-fns";
import Cookies from "js-cookie";

/* eslint-disable camelcase */
/* Since we can not modify the api response we need to disable the camcase rule for the API repsonse */
type WorkSchemaFromAPI = {
  absence_hours: number;
  date: Date;
  holiday: 0 | 1;
  present_hours: number;
  theoretical_hours: number;
  work_hours: number;
};
/* eslint-disable */

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;
  ApiUrl = "/api/v1";

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
    // Fetch cookie param after SAML auth //getToken endpoint
    Cookies.set(
      "hosted-tools-api-auth-2",
      "397C8C08D187A25E96987701D44C61CBEEE6C139",
      { expires: 7, path: "", secure: true }
    );
  }

  async getWorkScheme(params: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
  }) {
    const { startDate, endDate } = params;

    const startDateFormat = format(startDate, "yyyy-MM-dd");
    const endDateFormat = format(endDate, "yyyy-MM-dd");

    // Should be done only once for the user and not per request. use store.
    try {
      const employeeId = await this.axios.$get(`${this.ApiUrl}/users/me`, {
        withCredentials: true,
      });

      const response = await this.axios.$get<{ data: WorkSchemaFromAPI[] }>(
        `${this.ApiUrl}/users/${employeeId}/worktime?date_from=${startDateFormat}&date_to=${endDateFormat}`,
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
      console.log("API error", error);
    }
  }
}
