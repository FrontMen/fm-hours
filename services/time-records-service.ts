import type {NuxtAxiosInstance} from '@nuxtjs/axios';

export default class RecordsService {
  axios: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getEmployeeRecords<RecordType>(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RecordType[]> {
    return (
      await this.axios.get('api/time-record/get-by-employee', {
        params: {
          employeeId: params.employeeId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      })
    ).data;
  }

  async getRecords<RecordType>(params: {startDate: Date; endDate: Date}): Promise<RecordType[]> {
    return (
      await this.axios.get('api/time-record/get', {
        params: {
          startDate: params.startDate.getTime().toString(),
          endDate: params.endDate.getTime().toString(),
        },
      })
    ).data;
  }

  async addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }) {
    return (
      await this.axios.post('api/bridge/worklogs', {
        timeRecords: params.timeRecords,
        contracts: params.contracts,
        bridgeUid: params.bridgeUid,
      })
    ).data;
  }

  async removeBridgeWorklogs(timeRecords: TimeRecord[]) {
    return (
      await this.axios.delete('api/bridge/worklogs', {
        data: {
          timeRecords,
        },
      })
    ).data;
  }

  async saveEmployeeRecords<RecordType extends {id: string | null; hours: number}>(params: {
    employeeId: string;
    bridgeUid?: string;
    timeRecords: RecordType[];
    contracts?: number[];
  }) {
    return (
      await this.axios.post('api/time-record/create-or-update', {
        employeeId: params.employeeId,
        bridgeUid: params.bridgeUid,
        timeRecords: params.timeRecords,
        contracts: params.contracts,
      })
    ).data;
  }

  async deleteEmployeeRecords<RecordType extends {id: string | null}>(params: {
    recordsToDelete: RecordType[];
  }): Promise<void> {
    return (
      await this.axios.delete('api/employee/delete', {
        data: {
          recordsToDelete: params.recordsToDelete,
        },
      })
    ).data;
  }
}
