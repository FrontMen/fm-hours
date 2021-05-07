import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class WeeklyTimesheetStatusService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getWeeklyTimesheets(params: {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const query = this.fire.firestore.collection("weekly_timesheets_status");

    if (params.startDate)
      query.where("startDate", ">=", params.startDate.getTime());

    if (params.endDate) query.where("endDate", "<=", params.endDate.getTime());

    if (params.employeeId) query.where("employeeId", "==", params.employeeId);

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<WeeklyTimesheetStatus, "id">),
    }));
  }

  async getWeeklyTimesheet(params: { employeeId: string; startDate: Date }) {
    const snapshot = await this.fire.firestore
      .collection("weekly_timesheets_status")
      .where("employeeId", "==", params.employeeId)
      .where("startDate", "==", params.startDate.getTime())
      .get();

    const doc = snapshot.docs[0];

    if (!doc) return null;

    return {
      id: doc.id,
      ...(doc.data() as Omit<WeeklyTimesheetStatus, "id">),
    };
  }

  async createWeeklyTimesheet(params: Omit<WeeklyTimesheetStatus, "id">) {
    const ref = this.fire.firestore.collection("weekly_timesheets_status");
    const { id } = await ref.add(params);

    return { ...params, id };
  }

  async updateWeeklyTimesheetStatus(params: {
    weeklyTimesheet: WeeklyTimesheetStatus;
    status: RecordStatus;
    timeRecordIds: string[];
    travelRecordIds: string[];
  }) {
    const { status, timeRecordIds, travelRecordIds } = params;

    const newWeeklyTimesheet: WeeklyTimesheetStatus = {
      ...params.weeklyTimesheet,
      status,
      timeRecordIds,
      travelRecordIds,
    };

    await this.fire.firestore
      .collection("weekly_timesheets_status")
      .doc(params.weeklyTimesheet.id)
      .update(newWeeklyTimesheet);

    return newWeeklyTimesheet;
  }
}
