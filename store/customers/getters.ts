import {GetterTree} from 'vuex';

const getters: GetterTree<CustomersStoreState, RootStoreState> = {
  defaultCustomers(state): Customer[] {
    return state.customers.filter(customer => customer.isDefault);
  },
  customersList(state): Customer[] {
    return state.customers;
  },
};

export default getters;
