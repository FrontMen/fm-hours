/* eslint-disable @typescript-eslint/no-unused-vars */

export const state = () => ({
  customers: [],
  selectedCustomer: null,
});

export const actions = {
  async addNewCustomer(context, payload) {
    const ref = this.$fire.firestore.collection("customers");
    const { id } = await ref.add(payload);
    context.commit("addNewCustomerSuccess", {
      ...payload,
      id,
    });
  },
  async getCustomers(context) {
    const ref = this.$fire.firestore.collection("customers");
    const customers = await ref.get();
    const customersEntities = customers.docs.map((res) => ({
      id: res.id,
      ...res.data(),
    }));
    context.commit("getCustomersSuccess", customersEntities);
  },
};

export const mutations = {
  getCustomersSuccess(state, payload) {
    state.customers = payload;
  },
  addNewCustomerSuccess(state, payload) {
    state.customers = [...state.customers, payload];
  },
};

export const getters = {
  getCustomers: (state) => {
    return state.customers;
  },
  getSelectableCustomers: (state, getters, rootState, rootGetters) => {
    const customers = getters.getCustomers;
    const records = rootGetters["user/getTimeRecordsForCurrentWeek"];
    const selectedCustomers = [...new Set(records.map((c) => c.customer))];

    const defaultOption = { text: "Choose project", disabled: true };
    const options = customers
      .filter((entry) => !selectedCustomers.includes(entry.name))
      .map((entry) => ({ value: entry.id, text: entry.name }));

    return [defaultOption, ...options];
  },
};
