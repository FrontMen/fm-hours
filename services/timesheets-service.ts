import firebase from 'firebase/compat';
import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentData} from '@firebase/firestore-types';
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
    // Only do firebase calls on client side
    if (this.isServer) return [];

    let query:
      | firebase.firestore.CollectionReference<DocumentData>
      | firebase.firestore.Query<DocumentData> = this.fire.firestore.collection(
      Collections.TIMESHEETS
    );

    if (date && !startDate && !endDate) query = query.where('date', '==', date);

    if (startDate && !date) query = query.where('date', '>=', new Date(startDate).getTime());

    if (endDate && !date) query = query.where('date', '<=', new Date(endDate).getTime());

    if (employeeId) query = query.where('employeeId', '==', employeeId);

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Timesheet, 'id'>),
    }));
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
