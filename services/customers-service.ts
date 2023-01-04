import Service from './Service';
import RepositoryManager, {Customer, DocumentWithId} from '~/repositories';

// TODO: replace Customer-suffixed methods with generic methods throughout the codebase
export default class CustomersService extends Service<Customer> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.customers);
  }

  getCustomers() {
    return this.getAll()
  }

  getCustomersByIds(ids: string[]) {
    return this.getByIds(ids)
  }

  addCustomer(resource: Customer) {
    return this.add(resource);
  }

  getDefaultCustomers() {
    return this.repository.getByQuery([['isDefault', '==', true]]);
  }

  updateCustomer(customer: DocumentWithId<Customer>) {
    return this.update(customer);

    // TODO: Figure out how to remove fields without having firestore complexity leak into here
    //   const newCustomer = {...customer} as any;
    //   delete newCustomer.id;

    //   // Remove contract field if it isn't provided
    //   if (!newCustomer.contract) {
    //     newCustomer.contract = this.fireModule.firestore.FieldValue.delete();
    //   }

    //   return await this.fire.firestore
    //     .collection(Collections.CUSTOMERS)
    //     .doc(customer.id)
    //     .update(newCustomer);
    // }
  }
}
