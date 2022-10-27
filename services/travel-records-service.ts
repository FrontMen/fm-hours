import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {Collections} from '~/types/enums';

export default class RecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployeeRecords(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TravelRecord[]> {
    const query = await this.fire.firestore
      .collection(Collections.TRAVELREC)
      .where('employeeId', '==', params.employeeId);

    if (params.startDate) query.where('date', '>=', new Date(params.startDate).getTime());

    if (params.endDate) query.where('date', '<=', new Date(params.endDate).getTime());

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as TravelRecord),
    }));
  }

  async getRecords(params: {startDate: Date; endDate: Date}): Promise<TimeRecord[]> {
    const snapshot = await this.fire.firestore
      .collection(Collections.TRAVELREC)
      .where('date', '>=', params.startDate.getTime())
      .where('date', '<=', params.endDate.getTime())
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as TimeRecord),
    }));
  }

  async saveEmployeeRecords(params: {employeeId: string; travelRecords: TravelRecord[]}) {
    const ref = this.fire.firestore.collection(Collections.TRAVELREC);

    const updatedRecords = await Promise.all(
      params.travelRecords.map(async record => {
        return await this.updateRecord(ref, params.employeeId, record);
      })
    );

    return updatedRecords.filter(x => !!x.id);
  }

  private async updateRecord(
    ref: any,
    employeeId: string,
    record: TravelRecord
  ): Promise<TravelRecord> {
    const {id, kilometers} = record;

    const newRecord: any = {...record};
    delete newRecord.id;

    if (id) {
      const shouldDelete = kilometers <= 0;

      if (shouldDelete) await ref.doc(id).delete();
      else await ref.doc(id).update(newRecord);

      return {
        ...newRecord,
        id: shouldDelete ? null : id,
      };
    }

    if (kilometers > 0) {
      const newDocument = await ref.add({employeeId, ...newRecord});

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }
}
