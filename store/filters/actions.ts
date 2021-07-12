import { ActionTree } from 'vuex';

const actions: ActionTree<FiltersStoreState, RootStoreState> = {
  updateCustomerIsArchived({ commit }, payload: boolean) {
    commit('setCustomerIsArchived', payload);
  },
  updateCustomerSearchTerm({ commit }, payload: string) {
    commit('setCustomerSearchTerm', payload);
  },
  updateCustomerSearchCriteria({ commit }, payload: 'name'|'debtor') {
    commit('setCustomerSearchCriteria', payload);
  },
  updateCustomerSortDescending({ commit }, payload: boolean) {
    commit('setCustomerSortDescending', payload);
  },
  updateCustomerSortBy({ commit }, payload: string) {
    commit('setCustomerSortBy', payload);
  },
};

export default actions;
