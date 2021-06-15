import { format } from "date-fns";

import { NuxtAxiosInstance } from "@nuxtjs/axios";

export default class WorkSchemeService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  getWorkScheme(params: {
    bridgeUid: string;
    startDate: Date;
    endDate: Date;
  }) {
    const { startDate, endDate } = params;


    try {
      const response = this.axios.$get(
        `api/v1/users/${bridgeUid}/worktime?date_from=${format(startDate, "yyyy-MM-dd")}&date_to=${format(endDate, "yyyy-MM-dd")}`,
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

  //   return [
  //     {
  //       date: "2020-03-08",
  //       theoreticalHours: 8,
  //       absenceHours: 0,
  //       workHours: 8,
  //       holiday: 0,
  //     },
  //     {
  //       date: "2020-03-09",
  //       theoreticalHours: 8,
  //       absenceHours: 4,
  //       workHours: 4,
  //       holiday: 0,
  //     },
  //     {
  //       date: "2020-03-10",
  //       theoreticalHours: 8,
  //       absenceHours: 0,
  //       workHours: 0,
  //       holiday: 8,
  //     },
  //     {
  //       date: "2020-03-11",
  //       theoreticalHours: 8,
  //       absenceHours: 0,
  //       workHours: 8,
  //       holiday: 0,
  //     },
  //     {
  //       date: "2020-03-12",
  //       theoreticalHours: 8,
  //       absenceHours: 0,
  //       workHours: 8,
  //       holiday: 0,
  //     },
  //     {
  //       date: "2020-03-13",
  //       theoreticalHours: 0,
  //       absenceHours: 0,
  //       workHours: 0,
  //       holiday: 0,
  //     },
  //     {
  //       date: "2020-03-14",
  //       theoreticalHours: 0,
  //       absenceHours: 0,
  //       workHours: 0,
  //       holiday: 0,
  //     },
  //   ];
  // }
}
