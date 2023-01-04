import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import Repository from './Repository';
import {Collections} from '~/types/enums';

export type {
  DocumentData,
  DocumentWithId,
  WhereTuple,
  OrderTuple,
} from './Repository';

export type Team = {
  name: string;
  createdAt?: number;
  archived?: boolean;
};

export type TravelRecord = {
  date: number;
  kilometers: number;
  employeeId?: string;
}

export default class RepositoryManager {
  adminList: Repository;
  customers: Repository;
  employees: Repository;
  standbyRecords: Repository;
  teams: Repository<Team>;
  timesheets: Repository;
  timeRecords: Repository;
  travelRecords: Repository<TravelRecord>;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.adminList = new Repository(Collections.ADMINS, fire, fireModule);
    this.customers = new Repository(Collections.CUSTOMERS, fire, fireModule);
    this.employees = new Repository(Collections.EMPLOYEES, fire, fireModule);
    this.standbyRecords = new Repository(Collections.STANDBYREC, fire, fireModule);
    this.teams = new Repository(Collections.TEAMS, fire, fireModule);
    this.timesheets = new Repository(Collections.TIMREC, fire, fireModule);
    this.timeRecords = new Repository(Collections.TIMREC, fire, fireModule);
    this.travelRecords = new Repository(Collections.TRAVELREC, fire, fireModule);
  }
}
