import {MutationTree} from 'vuex';

const mutations: MutationTree<CustomersStoreState> = {
  getCustomersSuccess(state, payload: {customers: Customer[]}) {
    state.customers = payload.customers;
  },

  addNewCustomerSuccess(state, payload: {customer: Customer}) {
    state.customers = [...state.customers, payload.customer];
  },

  updateCustomer(state, payload: {customer: Customer}) {
    state.customers = state.customers.map(cust => {
      if (cust.id === payload.customer.id) return payload.customer;
      return cust;
    });
  },
};

export default mutations;
