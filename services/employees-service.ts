import type {NuxtFireInstance} from '@nuxtjs/firebase';
import {DocumentSnapshot} from '@firebase/firestore-types';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default class EmployeesService {
  fire: NuxtFireInstance;
  fireModule: typeof firebase;
  repositories: any;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase, repositories: any) {
    this.fire = fire;
    this.fireModule = fireModule;
    this.repositories = repositories;
  }

  async getAll(): Promise<Employee[]> {
    const foo = await this.repositories.employees.all();
    console.log('Testing if the repository works...');
    console.log(foo);

    const ref = this.fire.firestore.collection(Collections.EMPLOYEES);
    const snapshot = await ref.get();

    const adminEmails = await this.getAdminEmails();

    return snapshot.docs.map((res: any) => {
      const email = res.data().email;
      const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
      const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

      return {
        id: res.id,
        ...res.data(),
        isAdmin: adminEmails.some(mail => [fmMail, ioMail].includes(mail)),
      };
    });
  }

  async getById(employeeId: string): Promise<Employee | null> {
    const ref = this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .where(this.fireModule.firestore.FieldPath.documentId(), '==', employeeId);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return {
        ...this.mapEmployeeFromDocument(snapshot.docs[0]),
        isAdmin: await this.isAdmin(snapshot.docs[0].data().email),
      };
    }

    return null;
  }

  async getByMail(email: string): Promise<Employee | null> {
    // TODO: remove when migrated to iO mail
    const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
    const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

    const ref = this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .where('email', 'in', [fmMail, ioMail]);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      return {
        ...this.mapEmployeeFromDocument(snapshot.docs[0]),
        isAdmin: await this.isAdmin(snapshot.docs[0].data().email),
      };
    }

    return null;
  }

  async add(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const {isAdmin, ...emp} = employee;
    const newEmployee = {
      ...emp,
      created: new Date().getTime(),
    };

    const ref = this.fire.firestore.collection(Collections.EMPLOYEES);
    const {id} = await ref.add(newEmployee);

    if (isAdmin) {
      const list = await this.getAdminEmails();
      list.push(newEmployee.email);
      await this.updateAdminEmails(list);
    }

    return {
      ...newEmployee,
      id,
      isAdmin,
    };
  }

  async update(employee: Employee): Promise<void> {
    const {isAdmin, ...emp} = employee;
    const newEmployee = {...emp} as any;
    delete newEmployee.id;

    let list = await this.getAdminEmails();
    const totalAdmins = list.length;
    if (isAdmin && !list.includes(newEmployee.email)) {
      list.push(newEmployee.email);
    } else if (!isAdmin) {
      list = list.filter(a => a !== newEmployee.email);
    }

    // Check if the the list of admins changed
    if (list.length !== totalAdmins) {
      await this.updateAdminEmails(list);
    }

    return await this.fire.firestore
      .collection(Collections.EMPLOYEES)
      .doc(employee.id)
      .set(newEmployee, {merge: true});
  }

  async delete(id: string): Promise<void> {
    return await this.fire.firestore.collection(Collections.EMPLOYEES).doc(id).delete();
  }

  private async isAdmin(email: string): Promise<boolean> {
    // TODO: remove when migrated to iO mail
    const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
    const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

    const adminEmails = await this.getAdminEmails();
    return adminEmails.some(mail => [fmMail, ioMail].includes(mail));
  }

  private async getAdminEmails(): Promise<string[]> {
    const ref = this.fire.firestore.collection(Collections.ADMINS);
    const snapshot = await ref.get();
    const result = snapshot.docs[0].data().admins || [];

    return result as string[];
  }

  private async updateAdminEmails(adminList: string[]): Promise<string[]> {
    const docs = await this.fire.firestore.collection(Collections.ADMINS).get();
    const docId = docs.docs[0].id;
    const ref = await this.fire.firestore.collection(Collections.ADMINS).doc(docId);

    await ref.update({admins: adminList});
    return adminList;
  }

  private mapEmployeeFromDocument(doc: DocumentSnapshot): Omit<Employee, 'isAdmin'> {
    return {
      ...(doc.data() as Omit<Employee, 'isAdmin'>),
      id: doc.id,
    };
  }
}
