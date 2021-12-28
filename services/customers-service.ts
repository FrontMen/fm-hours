import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';
import FieldPath = firebase.firestore.FieldPath;

export default class CustomersService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getCustomers() {
    const ref = this.fire.firestore.collection(Collections.CUSTOMERS);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async getCustomersByIds(ids: Array<String>) {
    const ref = this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .where(FieldPath.documentId(), 'in', ids);

    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async addCustomer(customer: Omit<Customer, 'id'>) {
    const ref = this.fire.firestore.collection(Collections.CUSTOMERS);
    const {id} = await ref.add(customer);

    return {
      ...customer,
      id,
    };
  }

  async getDefaultCustomers() {
    const ref = this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .where('isDefault', '==', true);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async updateCustomer(customer: Customer) {
    const newCustomer = {...customer} as any;
    delete newCustomer.id;

    return await this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .doc(customer.id)
      .update(newCustomer);
  }

  deleteCustomer(id: string) {
    return this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .doc(id)
      .delete();
  }
}
