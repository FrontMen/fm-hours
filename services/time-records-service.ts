/* eslint-disable camelcase */
import {NuxtFireInstance} from '@nuxtjs/firebase';

export default class RecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployeeRecords<RecordType>(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }, collection: string = 'time_records'): Promise<RecordType[]> {
    let query = this.fire.firestore
      .collection(collection)
      .where('employeeId', '==', params.employeeId);

    if (params.startDate) {
      query = query.where('date', '>=', new Date(+params.startDate).getTime());
    }

    if (params.endDate) {
      query = query.where('date', '<=', new Date(+params.endDate).getTime());
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as RecordType),
    }));
  }

  async getRecords(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<TimeRecord[]> {
    const snapshot = await this.fire.firestore
      .collection('time_records')
      .where('date', '>=', params.startDate.getTime())
      .where('date', '<', params.endDate.getTime())
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TimeRecord),
    }));
  }

  async saveEmployeeRecords(params: {
    employeeId: string;
    timeRecords: TimeRecord[];
  }) {
    const ref = this.fire.firestore.collection('time_records');

    const updatedRecords = await Promise.all(
      params.timeRecords.map(async (timeRecord) => {
        return await this.updateRecord(ref, params.employeeId, timeRecord);
      })
    );

    return updatedRecords.filter((x) => !!x.id);
  }

  private async updateRecord(
    ref: any,
    employeeId: string,
    record: TimeRecord
  ): Promise<TimeRecord> {
    const {id, hours} = record;

    const newRecord: any = {...record};
    delete newRecord.id;

    if (id) {
      const shouldDelete = hours <= 0;

      if (shouldDelete) await ref.doc(id).delete();
      else await ref.doc(id).update(newRecord);

      return {
        ...newRecord,
        id: shouldDelete ? null : id,
      };
    }

    if (hours > 0) {
      const newDocument = await ref.add({employeeId, ...newRecord});

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }

  async deleteEmployeeRecords(params: {
    recordsToDelete: TimeRecord[];
  }): Promise<void> {
    const batch = this.fire.firestore.batch();

    params.recordsToDelete.forEach((record) => {
      if (record.id) {
        const ref = this.fire.firestore
          .collection('time_records')
          .doc(record.id!);

        batch.delete(ref);
      }
    });

    return await batch.commit();
  }
}
