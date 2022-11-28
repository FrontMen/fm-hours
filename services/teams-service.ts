import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default class EmployeesService {
  fire: NuxtFireInstance;
  fireModule: typeof firebase;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.fire = fire;
    this.fireModule = fireModule;
  }

  async getTeams(): Promise<string[]> {
    const ref = this.fire.firestore.collection(Collections.TEAMS);
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().teams || [];

    return result as string[];
  }
}
