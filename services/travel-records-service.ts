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
      .collection("travel_records")
      .where("userId", "==", params.userId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getPendingOrDeniedRecords(): Promise<TravelRecord[]> {
    const snapshot = await this.fire.firestore
      .collection("travel_records")
      .where("status", "in", [recordStatus.PENDING, recordStatus.DENIED])
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TravelRecord),
    }));
  }

  async saveUserRecords(params: {
    userId: string;
    travelRecords: TravelRecord[];
  }) {
    const ref = this.fire.firestore.collection("travel_records");

    const updatedRecords = await Promise.all(
      params.travelRecords.map(async (record) => {
        return await this.updateRecord(ref, params.userId, record);
      })
    );

    return updatedRecords.filter((x) => !!x.id);
  }

  private async updateRecord(
    ref: any,
    userId: string,
    record: TravelRecord
  ): Promise<TravelRecord> {
    const { id, kilometers } = record;

    const newRecord: any = { ...record };
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
      const newDocument = await ref.add({ userId, ...newRecord });

      return {
        ...newRecord,
        id: newDocument.id,
      };
    }

    return record;
  }
}
