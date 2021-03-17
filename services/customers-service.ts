import { NuxtFireInstance } from "@nuxtjs/firebase";

export default class CustomersService {
  fire: NuxtFireInstance;

  constructor(fire: NuxtFireInstance) {
    this.fire = fire;
  }

  async getCustomers() {
    const ref = this.fire.firestore.collection("customers");
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async addCustomer(customer: { name: string; debtor: string }) {
    const ref = this.fire.firestore.collection("customers");
    const { id } = await ref.add(customer);

    return {
      ...customer,
      id,
    };
  }
}
