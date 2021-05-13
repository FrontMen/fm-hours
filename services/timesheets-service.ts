import { DocumentData } from "@google-cloud/firestore";
import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class TimesheetsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getTimesheets(
    startDate?: number,
    endDate?: number,
    employeeId?: string,
    date?: number
  ) {
    let query:
      | firebase.default.firestore.CollectionReference<DocumentData>
      | firebase.default.firestore.Query<
          DocumentData
        > = this.fire.firestore.collection("timesheets");

    if (date) query = query.where("date", "==", date);

    if (startDate)
      query = query.where("date", ">=", new Date(startDate).getTime());

    if (endDate) query = query.where("date", "<=", new Date(endDate).getTime());

    if (employeeId) query = query.where("employeeId", "==", employeeId);

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, "id">),
    }));
  }

  async saveTimesheet(
    timesheet: Optional<Timesheet, "id">
  ): Promise<Timesheet> {
    const ref = this.fire.firestore.collection("timesheets");

    const { id, ...newTimesheet } = timesheet;

    if (id) {
      await ref.doc(id).update(newTimesheet);

      return { id, ...newTimesheet };
    }

    const newDocument = await ref.add(newTimesheet);

    return { ...newTimesheet, id: newDocument.id };
  }
}
