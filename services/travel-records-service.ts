import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class RecordsService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getEmployeeRecords(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TravelRecord[]> {
    return (
      await this.axios.get('api/travel-record/get-by-employee', {
        params: {
          employeeId: params.employeeId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      })
    ).data;
  }

  async getRecords(params: {startDate: Date; endDate: Date}): Promise<TimeRecord[]> {
    return (
      await this.axios.get('api/travel-record/get', {
        params: {
          startDate: params.startDate.getTime(),
          endDate: params.endDate.getTime(),
        },
      })
    ).data;
  }

  async saveEmployeeRecords(params: {employeeId: string; travelRecords: TravelRecord[]}) {
    return (
      await this.axios.post('api/travel-record/create-employee-record', {
        travelRecords: params.travelRecords,
        employeeId: params.employeeId,
      })
    ).data;
  }
}
