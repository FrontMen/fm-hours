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

  get(id?: string): Promise<Team[] | Team | undefined> {
    return id ? this.getById(id) : this.getAll();
  }

  private async getAll(): Promise<Team[]> {
    const snapshot = await this.fire.firestore.collection(Collections.TEAMS).get();

    return snapshot.docs.map((res: any) => {
      const team = res.data();
      return {
        id: res.id,
        ...team,
      } as Team;
    });
  }

  private async getById(id: string): Promise<Team | undefined> {
    const snapshot = await this.fire.firestore
      .collection(Collections.TEAMS)
      .where(this.fireModule.firestore.FieldPath.documentId(), '==', id)
      .get();

    if (!snapshot.empty) {
      return {
        ...(snapshot.docs[0].data() as Team),
        id: snapshot.docs[0].id,
      };
    }
    return undefined;
  }

  async add(params: Omit<Team, 'id' | 'createdAt'>): Promise<Team> {
    const toAdd = {
      ...params,
      createdAt: new Date().getTime(),
    };

    const {id} = await this.fire.firestore.collection(Collections.TEAMS).add(toAdd);

    return {...toAdd, id} as unknown as Team;
  }

  async update(team: Team): Promise<void> {
    const toUpdate = {...team} as any;
    delete toUpdate.id;

    return await this.fire.firestore
      .collection(Collections.TEAMS)
      .doc(team.id)
      .set(toUpdate, {merge: true});
  }

  async delete(id: string): Promise<void> {
    return await this.fire.firestore.collection(Collections.TEAMS).doc(id).delete();
  }
}
