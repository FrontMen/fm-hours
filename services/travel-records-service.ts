import RecordsService from './RecordsService';
import RepositoryManager, {TravelRecord, DocumentWithId, DocumentWithIdNull} from '~/repositories';

export default class TravelRecordsService extends RecordsService<TravelRecord> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.travelRecords);
  }

  async saveEmployeeRecords(params: {
    employeeId: string;
    travelRecords: (DocumentWithId<TravelRecord> | DocumentWithIdNull<TravelRecord> | TravelRecord)[];
  }) {
    const {employeeId, travelRecords} = params;
    const updatedRecords = await Promise.all(
      travelRecords.map(record => this.updateRecord({id: null, ...record, employeeId}))
    );

    return updatedRecords.filter(record => 'id' in record && record.id !== null);
  }

  private updateRecord(
    record: DocumentWithId<TravelRecord> | DocumentWithIdNull<TravelRecord> | TravelRecord
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
