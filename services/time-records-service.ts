/* eslint-disable camelcase */
import { NuxtFireInstance } from "@nuxtjs/firebase";
import { recordStatus } from "~/helpers/record-status";

export default class RecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getUserRecords(params: { userId: string; startDate?: string }) {
    const snapshot = await this.fire.firestore
      .collection("time_records")
      .where("userId", "==", params.userId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getPendingOrDeniedRecords(): Promise<TimeRecord[]> {
    const snapshot = await this.fire.firestore
      .collection("time_records")
      .where("status", "in", [recordStatus.PENDING, recordStatus.DENIED])
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TimeRecord),
    }));
  }

  async saveUserRecords(params: { userId: string; timeRecords: TimeRecord[] }) {
    const ref = this.fire.firestore.collection("time_records");

    const updatedRecords = await Promise.all(
      params.timeRecords.map(async (timeRecord) => {
        return await this.updateRecord(ref, params.userId, timeRecord);
      })
    );

    return updatedRecords.filter((x) => !!x.id);
  }

  private async updateRecord(
    ref: any,
    userId: string,
    record: TimeRecord
  ): Promise<TimeRecord> {
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
      const newDocument = await ref.add({ userId, ...newRecord });

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }

  async deleteUserRecords(params: {
    recordsToDelete: TimeRecord[];
  }): Promise<void> {
    const batch = this.fire.firestore.batch();

    params.recordsToDelete.forEach((record) => {
      if (record.id) {
        const ref = this.fire.firestore
          .collection("time_records")
          .doc(record.id!);

        batch.delete(ref);
      }
    });

    return await batch.commit();
  }
}
