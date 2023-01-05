import RecordsService from './RecordsService';
import RepositoryManager, {TravelRecord, DocumentWithId} from '~/repositories';

export default class TravelRecordsService extends RecordsService<TravelRecord> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.travelRecords);
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
      const {id, ...doc} = record;
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
