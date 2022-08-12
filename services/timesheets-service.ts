import type {NuxtFireInstance} from '@nuxtjs/firebase';
import axios from 'axios';
import {Collections} from '~/types/enums';

import {recordStatus} from '~/helpers/record-status';

export default class TimesheetsService {
  fire: NuxtFireInstance;
  isServer: boolean;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
    this.isServer = process.server;
  }

  async getTimesheets({date, startDate, endDate, employeeId}: GetTimesheetsProps) {
    let response = null;
    try {
      response = await axios.get(`/api/timesheets`, {
        params: {
          date,
          startDate,
          endDate,
          employeeId,
        },
      });

      return response.data;
    } catch (e: any) {
      return e.message;
    }
  }

  async getApprovedTimesheets(params: {startDate: number; endDate: number}): Promise<Timesheet[]> {
    const snapshot = await this.fire.firestore
      .collection(Collections.TIMESHEETS)
      .where('status', '==', recordStatus.APPROVED)
      .where('date', '>=', params.startDate)
      .where('date', '<=', params.endDate)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, 'id'>),
    }));
  }

  async saveTimesheet(timesheet: Optional<Timesheet, 'id'>): Promise<Timesheet> {
    const ref = this.fire.firestore.collection(Collections.TIMESHEETS);

    const {id, ...newTimesheet} = timesheet;

    if (id) {
      await ref.doc(id).update(newTimesheet);

      return {id, ...newTimesheet};
    }

    const newDocument = await ref.add(newTimesheet);

    return {...newTimesheet, id: newDocument.id};
  }
}
