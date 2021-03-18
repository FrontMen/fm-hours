/* eslint-disable camelcase */
import { NuxtFireInstance } from "@nuxtjs/firebase";
import { recordStatus } from "~/helpers/record-status";

export default class RecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getUserRecords(params: {
    userId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TravelRecord[]> {
    const query = await this.fire.firestore
      .collection("travel_records")
      .where("userId", "==", params.userId);

    if (params.startDate)
      query.where("date", ">=", new Date(params.startDate).getTime());

    if (params.endDate)
      query.where("date", "<=", new Date(params.endDate).getTime());

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TravelRecord),
    }));
  }

  async getApprovedRecords(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<TravelRecord[]> {
    const snapshot = await this.fire.firestore
      .collection("travel_records")
      .where("status", "==", recordStatus.APPROVED)
      .where("date", ">=", params.startDate.getTime())
      .where("date", "<=", params.endDate.getTime())
      .orderBy("date", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TravelRecord),
    }));
  }

  async getPendingOrDeniedRecords(): Promise<TravelRecord[]> {
    const snapshot = await this.fire.firestore
      .collection("travel_records")
      .where("status", "in", [recordStatus.PENDING, recordStatus.DENIED])
      .orderBy("date", "asc")
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
