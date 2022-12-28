export default class TimesheetsService {
  timesheetsRepository: ITimesheetsRepository;

  constructor(timesheetsRepository: ITimesheetsRepository) {
    this.timesheetsRepository = timesheetsRepository;
  }

  getTimesheets(params: GetTimesheetsProps) {
    return this.timesheetsRepository.getTimesheets(params);
  }

  getApprovedTimesheets(params: {startDate: number; endDate: number}): Promise<Timesheet[]> {
    return this.timesheetsRepository.getApprovedTimesheets(params);
  }

  saveTimesheet(timesheet: Optional<Timesheet, 'id'>): Promise<Timesheet> {
    return this.timesheetsRepository.saveTimesheet(timesheet);
  }
}
