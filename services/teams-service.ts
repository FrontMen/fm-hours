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

    // TEAMS MIGRATION
    if (snapshot.docs.length === 1) {
      // Create new teams
      const teams = snapshot.docs[0].data().teams;
      const newTeams: Team[] = [];
      for (const doc of teams) {
        const team = await this.add({name: doc});
        newTeams.push(team);
      }

      // set id's of teams on employees
      const empRef = this.fire.firestore.collection(Collections.EMPLOYEES);
      const empSnapshot = await empRef.get();

      for (const emp of empSnapshot.docs) {
        const employee = emp.data();

        const teamId = newTeams.find(a => a.name === employee.team)?.id || '';
        await empRef.doc(emp.id).set(
          {
            ...employee,
            team: teamId,
            picture: this.fireModule.firestore.FieldValue.delete(),
          },
          {merge: true}
        );
      }

      return newTeams;
    }

    return snapshot.docs
      .filter((res: any) => res.data().name) // TODO: remove after migration
      .map((res: any) => {
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
