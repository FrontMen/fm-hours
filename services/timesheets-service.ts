import firebase from 'firebase/compat';
import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentData} from '@firebase/firestore-types';
import type {NuxtAxiosInstance} from '@nuxtjs/axios';
import {startOfISOWeek} from 'date-fns';

import EmployeesService from './employees-service';
import ProjectsService from './projects-service';
import TimeRecordsService from './time-records-service';
import WorkSchemeService from './work-scheme-service';
import {Collections} from '~/types/enums';
import {recordStatus} from '~/helpers/record-status';
import {createWeeklyTimesheet} from '~/helpers/timesheet';
import {buildWeek} from '~/helpers/dates';

export default class TimesheetsService {
  fire: NuxtFireInstance;
  isServer: boolean;
  employeesService: EmployeesService;
  projectsService: ProjectsService;
  timeRecordsService: TimeRecordsService;
  workSchemeService: WorkSchemeService;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase, axios: NuxtAxiosInstance) {
    this.fire = fire;
    this.isServer = process.server;
    this.employeesService = new EmployeesService(fire, fireModule);
    this.projectsService = new ProjectsService(fire, fireModule);
    this.timeRecordsService = new TimeRecordsService(fire, fireModule, axios);
    this.workSchemeService = new WorkSchemeService(axios);
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

  async getWeeklyTimesheet({
    employeeId,
    startDate,
    checkOwnWorkScheme,
    isOwnTimesheet,
  }: {
    employeeId: string;
    startDate: Date;
    checkOwnWorkScheme: boolean;
    isOwnTimesheet: boolean;
  }) {
    const employee = await this.employeesService.getById(employeeId);
    if (!employee) return;
    const workWeek = buildWeek(startOfISOWeek(startDate));
    const startEpoch = new Date(workWeek[0].date).getTime();
    const sheets = await this.getTimesheets({employeeId, date: startEpoch});
    const sheet: Optional<Timesheet, 'id'> = sheets.length
      ? sheets[0]
      : {
          employeeId,
          date: new Date(workWeek[0].date).getTime(),
          status: recordStatus.NEW as TimesheetStatus,
          messages: [],
        };
    const workScheme = await this.workSchemeService.getWorkSchemeService({
      bridgeUid: employee.bridgeUid || '',
      sheet,
      workWeek,
      checkOwn: checkOwnWorkScheme,
      isOwnTimesheet,
    });
    const weeklyRecords = await this.timeRecordsService.getWeeklyRecords({
      employeeId,
      startDate,
    });
    const projects = await this.projectsService.getProjects(employeeId);

    return createWeeklyTimesheet({
      ...weeklyRecords,
      projects,
      workScheme,
    });
  }
}
