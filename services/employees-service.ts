import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentSnapshot} from '@firebase/firestore-types';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default class EmployeesService {
  fire: NuxtFireInstance;
  fireModule: typeof firebase;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.fire = fire;
    this.fireModule = fireModule;
  }

  async getEmployees(): Promise<Employee[]> {
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
      .where(this.fireModule.firestore.FieldPath.documentId(), '==', employeeId);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return this.mapEmployeeFromDocument(snapshot.docs[0]);
    }

    return null;
  }

  async getEmployeeByMail(email: string): Promise<Employee | null> {
    // TODO: remove when migrated to iO mail
    const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
    const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

    const ref = this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .where('email', 'in', [fmMail, ioMail]);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return this.mapEmployeeFromDocument(snapshot.docs[0]);
    }

    return null;
  }

  async createEmployee(params: Omit<Employee, 'id'>): Promise<Employee> {
    const newEmployee = {
      ...params,
      created: new Date().getTime(),
    };

    const ref = this.fire.firestore.collection(Collections.EMPLOYEES);
    const {id} = await ref.add(newEmployee);

    return {...newEmployee, id};
  }

  async updateEmployee(employee: Employee): Promise<void> {
    const newEmployee = {...employee} as any;
    delete newEmployee.id;

    return await this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .doc(employee.id)
      .set(newEmployee, {merge: true});
  }

  async deleteEmployee(id: string): Promise<void> {
    return await this.fire.firestore.collection(Collections.EMPLOYEES).doc(id).delete();
  }

  async isAdmin(email: string): Promise<boolean> {
    // TODO: remove when migrated to iO mail
    const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
    const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

    const adminEmails = await this.getAdminEmails();
    return adminEmails.some(mail => [fmMail, ioMail].includes(mail));
  }

  async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection(Collections.ADMINS);
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return result as string[];
  }

  async updateAdminEmails(adminList: string[]): Promise<string[]> {
    const docs = await this.fire.firestore.collection(Collections.ADMINS).get();
    const docId = docs.docs[0].id;
    const ref = await this.fire.firestore.collection(Collections.ADMINS).doc(docId);

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
