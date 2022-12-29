import {Collections} from '~/types/enums';

export default class TimeRecordsService {
  timeRecordsRepository: ITimeRecordsRepository;

  constructor(timeRecordsRepository: ITimeRecordsRepository) {
    this.timeRecordsRepository = timeRecordsRepository;
  }

  getEmployeeRecords<RecordType>(
    params: {
      employeeId: string;
      startDate?: string;
      endDate?: string;
    },
    collection: string = Collections.TIMREC
  ): Promise<RecordType[]> {
    return this.timeRecordsRepository.getEmployeeRecords(params, collection);
  }

  getRecords<RecordType>(
    params: {
      startDate: Date;
      endDate: Date;
    },
    collection: string = Collections.TIMREC
  ): Promise<RecordType[]> {
    return this.timeRecordsRepository.getRecords(params, collection);
  }

  addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }) {
    return this.timeRecordsRepository.addBridgeWorklogs(params);
  }

  addBridgeWorklog(record: TimeRecord, contractId: number, bridgeUid: string, ref: any) {
    return this.timeRecordsRepository.addBridgeWorklog(record, contractId, bridgeUid, ref);
  }

  removeBridgeWorklogs(timeRecords: TimeRecord[]) {
    return this.timeRecordsRepository.removeBridgeWorklogs(timeRecords);
  }

  removeBridgeWorklog(record: TimeRecord, ref: any) {
    return this.timeRecordsRepository.removeBridgeWorklog(record, ref);
  }

  saveEmployeeRecords<RecordType extends {id: string | null; hours: number}>(
    params: {
      employeeId: string;
      bridgeUid?: string;
      timeRecords: RecordType[];
      contracts?: number[];
    },
    collection: string = Collections.TIMREC
  ) {
    return this.timeRecordsRepository.saveEmployeeRecords(params, collection);
  }

  deleteEmployeeRecords<RecordType extends {id: string | null}>(
    params: {
      recordsToDelete: RecordType[];
    },
    collection: string = Collections.TIMREC
  ): Promise<void> {
    return this.timeRecordsRepository.deleteEmployeeRecords(params, collection);
  }

  getWeeklyRecords(params: {employeeId: string; startDate: Date}): Promise<WeeklyRecords> {
    return this.timeRecordsRepository.getWeeklyRecords(params);
  }
}
