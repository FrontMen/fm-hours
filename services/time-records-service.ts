export default class RecordsService {
  timeRecordsRepository: IRecordsRepository;

  constructor(timeRecordsRepository: IRecordsRepository) {
    this.timeRecordsRepository = timeRecordsRepository;
  }

  getEmployeeRecords<RecordType>(
    params: {
      employeeId: string;
      startDate?: string;
      endDate?: string;
    },
    collection: string
  ): Promise<RecordType[]> {
    return this.timeRecordsRepository.getEmployeeRecords(params, collection);
  }

  getRecords<RecordType>(
    params: {
      startDate: Date;
      endDate: Date;
    },
    collection: string
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
    collection: string
  ) {
    return this.timeRecordsRepository.saveEmployeeRecords(params, collection);
  }

  deleteEmployeeRecords<RecordType extends {id: string | null}>(
    params: {
      recordsToDelete: RecordType[];
    },
    collection: string
  ): Promise<void> {
    return this.timeRecordsRepository.deleteEmployeeRecords(params, collection);
  }
}
