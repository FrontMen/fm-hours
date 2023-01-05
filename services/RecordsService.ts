import Service from './Service';
import {WhereTuple} from '~/repositories';

type Record = {
  date: number;
  employeeId?: string; // TODO: remove undefined
};

export default class RecordsService<T extends Record = Record> extends Service<T> {
  getEmployeeRecords(params: {employeeId: string; startDate?: string; endDate?: string}) {
    const {employeeId, startDate, endDate} = params;

    return this.repository.getByQuery([
      ['employeeId', '==', employeeId],
      ...(startDate ? [['date', '>=', RecordsService.parseDate(startDate)] as WhereTuple<T>] : []),
      ...(endDate ? [['date', '<=', RecordsService.parseDate(endDate)] as WhereTuple<T>] : []),
    ]);
  }

  getRecords(params: {startDate: Date; endDate: Date}) {
    const {startDate, endDate} = params;
    return this.repository.getByQuery(
      RecordsService.buildDateRangeQuery(startDate.getTime(), endDate.getTime()),
      ['date', 'asc']
    );
  }

  static buildDateQuery<T extends Record>(date?: T['date']) {
    return [...(date ? [['date', '==', date] as WhereTuple<T>] : [])];
  }

  static buildDateRangeQuery<T extends Record>(startDate?: T['date'], endDate?: T['date']) {
    return [
      ...(startDate ? [['date', '>=', startDate] as WhereTuple<T>] : []),
      ...(endDate ? [['date', '<=', endDate] as WhereTuple<T>] : []),
    ];
  }

  static buildEmployeeQuery<T extends Record>(employeeId?: T['employeeId']) {
    return [...(employeeId ? [['employeeId', '==', employeeId] as WhereTuple<T>] : [])];
  }

  static parseDate(date: string): number {
    const number = new Date(date).getTime();
    if (typeof date === 'string' && Number.isNaN(number)) {
      return parseInt(date, 10);
    }
    return number;
  }
}
