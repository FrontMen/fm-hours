import { ActionTree } from "vuex";

const actions: ActionTree<CustomersStoreState, RootStoreState> = {
  async addNewCustomer({ commit }, payload: { name: string; debtor: string }) {
    const ref = this.$fire.firestore.collection("customers");
    const { id } = await ref.add(payload);

    commit("addNewCustomerSuccess", {
      customer: {
        ...payload,
        id,
      },
    });
  },

  async getCustomers({ commit }) {
    const ref = this.$fire.firestore.collection("customers");
    const results = await ref.get();

    const customers = results.docs.map((res) => ({
      id: res.id,
      ...res.data(),
    }));

    commit("getCustomersSuccess", { customers });
  },
};

export default actions;
