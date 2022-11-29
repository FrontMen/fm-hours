import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default class TeamsService {
  fire: NuxtFireInstance;
  fireModule: typeof firebase;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.fire = fire;
    this.fireModule = fireModule;
  }

  async get(): Promise<Team[]> {
    const ref = this.fire.firestore.collection(Collections.TEAMS);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => {
      const team = res.data();
      return {
        id: res.id,
        ...team,
      } as Team;
    });
  }

  async add(params: Omit<Team, 'id' | 'createdAt'>): Promise<Team> {
    const toAdd = {
      ...params,
      createdAt: new Date().getTime(),
    };

    const ref = this.fire.firestore.collection(Collections.TEAMS);
    const {id} = await ref.add(toAdd);

    return {...toAdd, id} as unknown as Team;
  }

  async update(team: Team): Promise<void> {
    const toUpdate = {...team} as any;
    delete toUpdate.id;

    const ref = this.fire.firestore.collection(Collections.TEAMS);
    return await ref.doc(team.id).set(toUpdate, {merge: true});
  }

  async delete(id: string): Promise<void> {
    return await this.fire.firestore.collection(Collections.TEAMS).doc(id).delete();
  }
}
