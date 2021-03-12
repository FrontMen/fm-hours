/* eslint-disable camelcase */
import { NuxtFireInstance } from "@nuxtjs/firebase";
import { isSameDay } from "date-fns";

export default class RecordsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  // MARK: helpers

  private getRecordsFromDoc = (
    doc: any
  ): {
    timeRecords: TimeRecord[];
    travelRecords: TravelRecord[];
  } => {
    const data = doc.exists ? doc.data() : {};

    return {
      timeRecords: data?.time_records || [],
      travelRecords: data?.travel_records || [],
    };
  };

  private isSameRecord(leftRecord: TimeRecord, rightRecord: TimeRecord) {
    return (
      leftRecord.customer.name === rightRecord.customer.name &&
      leftRecord.date === rightRecord.date
    );
  }

  private mergeTimeRecords(
    currentRecords: TimeRecord[],
    newRecords: TimeRecord[]
  ) {
    const records = [...currentRecords];

    newRecords.forEach((newRecord) => {
      const recordIndex = records.findIndex((existingRecord) =>
        this.isSameRecord(newRecord, existingRecord)
      );

      if (recordIndex === -1) {
        records.push(newRecord);
      } else if (newRecord.hours === 0) {
        records.splice(recordIndex, 1);
      } else {
        records[recordIndex] = newRecord;
      }
    });

    return records;
  }

  private mergeTravelRecords(
    currentRecords: TravelRecord[],
    newRecords: TravelRecord[]
  ) {
    const records = [...currentRecords];

    newRecords.forEach((newRecord) => {
      const recordIndex = records.findIndex((existingRecord) =>
        isSameDay(new Date(newRecord.date), new Date(existingRecord.date))
      );

      if (recordIndex === -1) {
        records.push(newRecord);
      } else if (newRecord.kilometers === 0) {
        records.splice(recordIndex, 1);
      } else {
        records[recordIndex] = newRecord;
      }
    });

    return records;
  }

  // MARK: public methods

  async getUserRecords(params: { userId: string; startDate?: string }) {
    const ref = this.fire.firestore.collection("records").doc(params.userId);
    const doc = await ref.get();

    return this.getRecordsFromDoc(doc);
  }

  async saveUserRecords(params: {
    userId: string;
    timeRecords: TimeRecord[];
    travelRecords: TravelRecord[];
  }) {
    const ref = this.fire.firestore.collection("records").doc(params.userId);
    const doc = await ref.get();
    const currentRecords = this.getRecordsFromDoc(doc);

    const mergedTimeRecords = this.mergeTimeRecords(
      currentRecords.timeRecords,
      params.timeRecords
    );

    const mergedTravelRecords = this.mergeTravelRecords(
      currentRecords.travelRecords,
      params.travelRecords
    );

    await ref.set(
      {
        time_records: mergedTimeRecords,
        travel_records: mergedTravelRecords,
      },
      { merge: true }
    );

    return {
      timeRecords: mergedTimeRecords,
      travelRecords: mergedTravelRecords,
    };
  }

  async deleteUserRecords(params: {
    userId: string;
    recordsToDelete: TimeRecord[];
  }) {
    const ref = this.fire.firestore.collection("records").doc(params.userId);
    const doc = await ref.get();

    const currentRecords = this.getRecordsFromDoc(doc);
    const mergedRecords = [...currentRecords.timeRecords].filter(
      (record) =>
        !params.recordsToDelete.some((recordToDelete) =>
          this.isSameRecord(record, recordToDelete)
        )
    );

    await ref.set(
      {
        time_records: mergedRecords,
      },
      { merge: true }
    );

    return mergedRecords;
  }
}
