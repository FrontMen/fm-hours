import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import {Collections} from '~/types/enums';

export default class CustomersService {
  fire: NuxtFireInstance;
  fireModule: typeof firebase;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.fire = fire;
    this.fireModule = fireModule;
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
      .where(this.fireModule.firestore.FieldPath.documentId(), 'in', ids);

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

    // Remove contract field if it isn't provided
    if (!newCustomer.contract) {
      newCustomer.contract = this.fireModule.firestore.FieldValue.delete();
    }

    return await this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .doc(customer.id)
      .update(newCustomer);
  }
}
