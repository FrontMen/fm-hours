import { GetterTree } from "vuex";

const getters: GetterTree<CustomersStoreState, RootStoreState> = {
  defaultCustomers(state): Customer[] {
    return state.customers.filter((customer) => customer.isDefault);
  },
};

export default getters;
