import {format} from 'date-fns';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import {recordStatus} from '~/helpers/record-status';

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

  // To be moved to Service layer when Sander's changes are merged
  async getWorkSchemeService({
    bridgeUid,
    sheet,
    workWeek,
    checkOwn,
    isOwnTimesheet,
  }: {
    bridgeUid: string;
    sheet: Optional<Timesheet, 'id'>;
    workWeek: WeekDate[];
    checkOwn: boolean;
    isOwnTimesheet: boolean;
  }): Promise<WorkScheme[]> {
    let workScheme: WorkScheme[] | undefined = [];

    if (sheet.status === recordStatus.NEW && (!checkOwn || isOwnTimesheet)) {
      workScheme = await this.getWorkScheme({
        bridgeUid: bridgeUid || '',
        startDate: new Date(workWeek[0].date),
        endDate: new Date(workWeek[6].date),
      });
    } else {
      workScheme = sheet.workscheme;
    }
    return workScheme || [];
  }
}
