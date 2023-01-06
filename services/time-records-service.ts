import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import RecordsService from './RecordsService';
import RepositoryManager, {DocumentWithId, DocumentWithIdNull, TimeRecord} from '~/repositories';

export default class TimeRecordsService extends RecordsService<TimeRecord> {
  axios: NuxtAxiosInstance;
  timesheetsService: TimesheetsService;
  travelRecordsService: TravelRecordsService;

  constructor(repositories: RepositoryManager, axios: NuxtAxiosInstance) {
    super(repositories, repositories.timeRecords);
    this.axios = axios;
    this.timesheetsService = new TimesheetsService(fire);
    this.travelRecordsService = new TravelRecordsService(fire);
  }

  addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }) {
    const {timeRecords, contracts, bridgeUid} = params;
    return Promise.all(
      timeRecords.map((record: TimeRecord, index) =>
        this.addBridgeWorklog(record, contracts[index], bridgeUid)
      )
    );
  }

  async addBridgeWorklog(
    record: TimeRecord | DocumentWithId<TimeRecord>,
    bridgeUid: string
    contractId: number,
  ) {
    if (record.hours <= 0 || !('id' in record && record.id !== null)) {
      return;
    }

    const {id, ...rest} = record;

    const {
      data: {worklogId},
    } = await this.axios.post('api/bridge/worklogs', {
      record,
      contractId,
      bridgeUid,
    });

    return this.repository.updateById(id, {
      ...rest,
      worklogId,
    });
  }

  removeBridgeWorklogs(timeRecords: TimeRecord[]) {
    return Promise.all(timeRecords.map(record => this.removeBridgeWorklog(record)));
  }

  async removeBridgeWorklog(record: TimeRecord | DocumentWithId<TimeRecord>) {
    if (!record.worklogId) return;
    if (!record.worklogId || !('id' in record && record.id !== null)) {
      return;
    }

    const {id, ...rest} = record;

    await this.axios.delete(`api/bridge/worklogs/${record.worklogId}`);

    return await this.repository.updateById(id, {
      ...rest,
      worklogId: null,
    });
  }

  async saveEmployeeRecords(params: {
    employeeId: string;
    bridgeUid?: string;
    timeRecords: (DocumentWithId<TimeRecord> | DocumentWithIdNull<TimeRecord> | TimeRecord)[];
    contracts?: number[];
  }) {
    const updatedRecords = await Promise.all(
      params.timeRecords.map((timeRecord, index) =>
        this.updateRecord(
          params.employeeId,
          timeRecord,
          params.contracts?.[index] || -1,
          params.bridgeUid
        )
      )
    );

    return updatedRecords.filter(record => 'id' in record && record.id !== null);
  }

  private UPDATE_BRIDGE_ON_SAVE = false;

  private async updateRecord(
    employeeId: string,
    record: DocumentWithId<TimeRecord> | DocumentWithIdNull<TimeRecord> | TimeRecord,
    contractId: number,
    bridgeUid?: string
  ): Promise<typeof record> {
    const hasContract = contractId > -1;
    const {hours} = record;

    if ('id' in record && record.id !== null) {
      const {id, ...doc} = record;
      const shouldDelete = hours <= 0;

      const shouldMutateBridge =
        this.UPDATE_BRIDGE_ON_SAVE && hasContract && !!doc.worklogId && !!bridgeUid;

      if (shouldDelete) {
        if (shouldMutateBridge) {
          await this.axios.delete(`api/bridge/worklogs/${doc.worklogId}`);
        }
        await this.repository.delete(record.id);
      } else {
        if (shouldMutateBridge) {
          await this.axios.put(`api/bridge/worklogs/${doc.worklogId}`, {
            record: doc,
            bridgeUid,
          });
        }
        await this.repository.updateById(id, {...doc, employeeId});
      }

      return {
        ...record,
        id: shouldDelete ? null : id,
      };
    }

    if (hours > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...doc} = {id: null, ...record}; // Make sure we don't have id: null in record
      if (this.UPDATE_BRIDGE_ON_SAVE && hasContract) {
        const {
          data: {worklogId},
        } = await this.axios.post('api/bridge/worklogs', {
          record: doc,
          contractId,
          bridgeUid,
        });
        doc.worklogId = worklogId;
      }

      return this.repository.add(doc);
    }

    return record;
  }

  deleteEmployeeRecord(params: {recordsToDelete: (TimeRecord & {id?: null | string})[]}) {
    const {recordsToDelete} = params;
    const ids = recordsToDelete.reduce(
      (acc: string[], record) => [...acc, ...('id' in record && record.id ? [record.id] : [])],
      []
    );
    this.repository.deleteBatch(ids);
  }

  async getWeeklyRecords({
    employeeId,
    startDate,
  }: {
    employeeId: string;
    startDate: Date;
  }): Promise<WeeklyRecords> {
    const workWeek = buildWeek(startOfISOWeek(startDate));
    const startEpoch = new Date(workWeek[0].date).getTime();

    const sheets = await this.timesheetsService.getTimesheets({employeeId, date: startEpoch});

    const sheet: Optional<Timesheet, 'id'> = sheets.length
      ? sheets[0]
      : {
          employeeId,
          date: new Date(workWeek[0].date).getTime(),
          status: recordStatus.NEW as TimesheetStatus,
          messages: [],
        };

    const range = {
      startDate: new Date(workWeek[0].date).getTime().toString(),
      endDate: new Date(workWeek[6].date).getTime().toString(),
    };

    const [timeRecords, standByRecords, travelRecords] = await Promise.all([
      this.getEmployeeRecords<TimeRecord>({employeeId, ...range}),
      this.getEmployeeRecords<StandbyRecord>({employeeId, ...range}, 'standby_records'),
      this.travelRecordsService.getEmployeeRecords({employeeId, ...range}),
    ]);

    return {
      sheet,
      week: workWeek,
      timeRecords,
      travelRecords,
      standByRecords,
    };
  }
}
