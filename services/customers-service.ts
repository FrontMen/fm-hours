import {NuxtFireInstance} from '@nuxtjs/firebase';
import {Collections} from '~/types/enums';

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

  async addCustomer(customer: Omit<Customer, 'id'>) {
    const ref = this.fire.firestore.collection(Collections.CUSTOMERS);
    const {id} = await ref.add(customer);

    return {
      ...customer,
      id,
    };
  }

  async getCustomersAvailableToAll() {
    const ref = this.fire.firestore
      .collection(Collections.CUSTOMERS)
      .where('availableToAll', '==', true);
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
