import { ActionTree } from "vuex";

const actions: ActionTree<CustomersStoreState, RootStoreState> = {
  async getCustomers({ commit }) {
    const customers = await this.app.$customersService.getCustomers();
    commit("getCustomersSuccess", { customers });
  },

  async addNewCustomer({ commit }, payload: { name: string; debtor: string }) {
    const newCustomer = await this.app.$customersService.addCustomer(payload);
    commit("addNewCustomerSuccess", { customer: newCustomer });
  },
};

export default actions;
