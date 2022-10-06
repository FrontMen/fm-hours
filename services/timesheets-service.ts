import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class TimesheetsService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getTimesheets({date, startDate, endDate, employeeId}: GetTimesheetsProps) {
    return (
      await this.axios.get(`/api/timesheet/get`, {
        params: {
          date,
          startDate,
          endDate,
          employeeId,
        },
      })
    ).data;
  }

  async getApprovedTimesheets(params: {startDate: number; endDate: number}): Promise<Timesheet[]> {
    return (
      await this.axios.get('/api/timesheet/get-approved', {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      })
    ).data;
  }

  async saveTimesheet(timesheet: Optional<Timesheet, 'id'>): Promise<Timesheet> {
    return (
      await this.axios.post('api/timesheet/create', {
        timesheet,
      })
    ).data;
  }
}
