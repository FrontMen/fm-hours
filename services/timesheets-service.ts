import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class TimesheetsService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getTimesheets(startDate?: number, endDate?: number) {
    const query = this.fire.firestore.collection("timesheets");

    if (startDate) query.where("date", ">=", new Date(startDate).getTime());

    if (endDate) query.where("date", "<=", new Date(endDate).getTime());

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, "id">),
    }));
  }
}
