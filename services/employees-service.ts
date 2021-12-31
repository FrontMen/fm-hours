import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentSnapshot} from '@firebase/firestore-types';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';
import FieldPath = firebase.firestore.FieldPath;

export default class EmployeesService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getEmployees() {
    const ref = this.fire.firestore.collection(Collections.EMPLOYEES);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    const ref = this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .where(FieldPath.documentId(), '==', employeeId);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return this.mapEmployeeFromDocument(snapshot.docs[0]);
    }

    return null;
  }

  async getEmployeeInformation(email: string): Promise<Employee | null> {
    const ref = this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .where('email', '==', email);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return this.mapEmployeeFromDocument(snapshot.docs[0]);
    }

    return null;
  }

  async createEmployee(
    params: Omit<Employee, 'id' | 'picture'>
  ): Promise<Employee> {
    const newEmployee = {
      ...params,
      picture: '',
      created: new Date().getTime(),
    };

    const ref = this.fire.firestore.collection(Collections.EMPLOYEES);
    const {id} = await ref.add(newEmployee);

    return {...newEmployee, id};
  }

  async updateEmployee(employee: Employee) {
    const newEmployee = {...employee} as any;
    delete newEmployee.id;

    return await this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .doc(employee.id)
      .set(newEmployee, {merge: true});
  }

  async deleteEmployee(id: string) {
    return await this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .doc(id)
      .delete();
  }

  async isAdmin(email: string) {
    const adminEmails = await this.getAdminEmails();
    return adminEmails.includes(email);
  }

  async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection(Collections.ADMINS);
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return result as unknown as string[];
  }

  async getTeams(): Promise<string[]> {
    const ref = this.fire.firestore.collection(Collections.TEAMS);
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().teams || [];

    return result as unknown as string[];
  }

  async updateAdminEmails(adminList: string[]): Promise<string[]> {
    const docs = await this.fire.firestore.collection(Collections.ADMINS).get();
    const docId = await docs.docs[0].id;
    const ref = await this.fire.firestore
      .collection(Collections.ADMINS)
      .doc(docId);

    await ref.update({admins: adminList});
    return adminList;
  }

  private mapEmployeeFromDocument(doc: DocumentSnapshot): Employee {
    return {
      ...(doc.data() as Employee),
      id: doc.id,
    };
  }
}
