export default class TravelRecordsService {
  travelRecordsRepository: ITravelRecordsRepository;

  constructor(travelRecordsRepository: ITravelRecordsRepository) {
    this.travelRecordsRepository = travelRecordsRepository;
  }

  getEmployeeRecords(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TravelRecord[]> {
    return this.travelRecordsRepository.getEmployeeRecords(params);
  }

  getRecords(params: {startDate: Date; endDate: Date}): Promise<TimeRecord[]> {
    return this.travelRecordsRepository.getRecords(params);
  }

  saveEmployeeRecords(params: {employeeId: string; travelRecords: TravelRecord[]}) {
    return this.travelRecordsRepository.saveEmployeeRecords(params);
  }
}
