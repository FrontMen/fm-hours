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

  async addCustomer(customer: Omit<Customer, "id">) {
    const ref = this.fire.firestore.collection("customers");
    const { id } = await ref.add(customer);

    return {
      ...customer,
      id,
    };
  }

  async getCustomersAvailableToAll() {
    const ref = this.fire.firestore
      .collection("customers")
      .where("availableToAll", "==", true);
    const snapshot = await ref.get();

    return snapshot.docs.map((res: any) => ({
      id: res.id,
      ...res.data(),
    }));
  }

  async updateCustomer(customer: Customer) {
    const newCustomer = { ...customer } as any;
    delete newCustomer.id;

    return await this.fire.firestore
      .collection("customers")
      .doc(customer.id)
      .update(newCustomer);
  }

  deleteCustomer(id: string) {
    return this.fire.firestore.collection("customers").doc(id).delete();
  }
}
