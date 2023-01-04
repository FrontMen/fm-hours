import Service from './Service';
import RepositoryManager, {TravelRecord, WhereTuple, DocumentWithId} from '~/repositories';

function parseDate(date: string): number {
  const number = new Date(date).getTime();
  if (Number.isNaN(number)) {
    return parseInt(date, 10);
  }
  return number;
}

export default class TravelRecordsService extends Service<TravelRecord> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.travelRecords);
  }

  getEmployeeRecords(params: {employeeId: string; startDate?: string; endDate?: string}) {
    const {employeeId, startDate, endDate} = params;

    return this.repository.getByQuery([
      ['employeeId', '==', employeeId],
      ...(startDate
        ? [['date', '>=', parseDate(startDate)] as WhereTuple<TravelRecord>]
        : []),
      ...(endDate ? [['date', '<=', parseDate(endDate)] as WhereTuple<TravelRecord>] : []),
    ]);
  }

  getRecords(params: {startDate: Date; endDate: Date}) {
    const {startDate, endDate} = params;

    return this.repository.getByQuery(
      [
        ['date', '>=', startDate.getTime()],
        ['date', '<=', endDate.getTime()],
      ],
      ['date', 'asc']
    );
  }

  async saveEmployeeRecords(params: {employeeId: string; travelRecords: TravelRecord[]}) {
    const {employeeId, travelRecords} = params;
    const updatedRecords = await Promise.all(
      travelRecords.map(record => this.updateRecord({id: null, ...record, employeeId})) // TODO: refactor to remove { id: null }
    );

    return updatedRecords.filter(record => 'id' in record && record.id !== null);
  }

  private updateRecord(
    record: DocumentWithId<TravelRecord> | (TravelRecord & {id: null}) // TODO: refactor to remove { id: null }
  ) {
    const {kilometers} = record;

    if ('id' in record && record.id !== null) {
      const {id, ...doc} = record as DocumentWithId<TravelRecord>;
      if (kilometers) {
        this.repository.updateById(id, doc);
      } else {
        this.repository.delete(id);
      }
    } else if (kilometers) {
      return this.repository.add(record);
    }
    return record;
  }
}
