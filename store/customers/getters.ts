import { GetterTree } from 'vuex';

const getters: GetterTree<CustomersStoreState, RootStoreState> = {
  getCustomers(state): Customer[] {
    return state.customers
  },

  getSelectableCustomers(state, _, __, rootGetters): CustomerOption[]  {
    const customers = state.customers
    const records = rootGetters['user/getTimeRecordsForCurrentWeek']

    // TODO: use record type
    const selectedCustomers = [...new Set(records.map((c: any) => c.customer))];

    const defaultOption = { text: "Choose project", disabled: true };
    const options = customers
      .filter((entry) => !selectedCustomers.includes(entry.name))
      .map((entry) => ({ value: entry.id, text: entry.name }));

    return [defaultOption, ...options];
  },

};

export default getters
