import { NuxtFireInstance } from "@nuxtjs/firebase";
import { Collections } from '~/types/enums';
/* eslint-disable camelcase */

export default class StandByRecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployeeRecords(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StandbyRecord[]> {
    let query = this.fire.firestore
      .collection(Collections.STANDBYREC)
      .where("employeeId", "==", params.employeeId);

    if (params.startDate){
      query = query.where("date", ">=", new Date(+params.startDate).getTime());}

    if (params.endDate){
      query = query.where("date", "<=", new Date(+params.endDate).getTime());}

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as StandbyRecord),
    }));
  }

  async getRecords(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<StandbyRecord[]> {
    const snapshot = await this.fire.firestore
      .collection(Collections.STANDBYREC)
      .where("date", ">=", params.startDate.getTime())
      .where("date", "<", params.endDate.getTime())
      .orderBy("date", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as StandbyRecord),
    }));
  }

  async saveEmployeeRecords(params: {
    employeeId: string;
    standByRecords: StandbyRecord[];
  }) {
    const ref = this.fire.firestore.collection(Collections.STANDBYREC);

    const updatedRecords = await Promise.all(
      params.standByRecords.map(async (standByRecord) => {
        return await this.updateRecord(ref, params.employeeId, standByRecord);
      })
    );

    return updatedRecords.filter((x) => !!x.id);
  }

  private async updateRecord(
    ref: any,
    employeeId: string,
    record: StandbyRecord
  ): Promise<StandbyRecord> {
    const { id, hours } = record;

    const newRecord: any = { ...record };
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
      const newDocument = await ref.add({ employeeId, ...newRecord });

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }

  async deleteEmployeeRecords(params: {
    recordsToDelete: StandbyRecord[];
  }): Promise<void> {
    const batch = this.fire.firestore.batch();

    params.recordsToDelete.forEach((record) => {
      if (record.id) {
        const ref = this.fire.firestore
          .collection(Collections.STANDBYREC)
          .doc(record.id!);

        batch.delete(ref);
      }
    });

    return await batch.commit();
  }
}
