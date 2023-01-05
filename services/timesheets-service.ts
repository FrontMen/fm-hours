import Service from './Service';
import {recordStatus} from '~/helpers/record-status';
import RepositoryManager, {DocumentWithId, WhereTuple, Timesheet} from '~/repositories';

function buildDateQuery<T extends {date: number}>(date?: T['date']) {
  return [...(date ? [['date', '==', date] as WhereTuple<T>] : [])];
}

function buildDateRangeQuery<T extends {date: number}>(startDate?: T['date'], endDate?: T['date']) {
  return [
    ...(startDate ? [['date', '>=', startDate] as WhereTuple<T>] : []),
    ...(endDate ? [['date', '<=', endDate] as WhereTuple<T>] : []),
  ];
}

function buildEmployeeQuery<T extends {employeeId: string}>(employeeId?: T['employeeId']) {
  return [...(employeeId ? [['employeeId', '==', employeeId] as WhereTuple<T>] : [])];
}

function buildStatusQuery<T extends {status: string}>(status?: T['status']) {
  return [...(status ? [['status', '==', status] as WhereTuple<T>] : [])];
}

export default class TimesheetsService extends Service<Timesheet> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.timesheets);
  }

  getTimesheets({date, startDate, endDate, employeeId}: GetTimesheetsProps) {
    return this.repository.getByQuery([
      ...buildEmployeeQuery(employeeId),
      ...buildDateRangeQuery(startDate, endDate),
      ...buildDateQuery(date),
    ]);
  }

  getApprovedTimesheets(params: {startDate: number; endDate: number}) {
    const {startDate, endDate} = params;
    return this.repository.getByQuery(
      [...buildStatusQuery(recordStatus.APPROVED), ...buildDateRangeQuery(startDate, endDate)],
      ['date', 'asc']
    );
  }

  async saveTimesheet(timesheet: Optional<DocumentWithId<Timesheet>, 'id'>): Promise<Timesheet> {
    if (!timesheet?.id) {
      return this.repository.add(timesheet);
    }
    await this.repository.updateById(timesheet.id, timesheet as DocumentWithId<Timesheet>);
    return timesheet;
  }
}
