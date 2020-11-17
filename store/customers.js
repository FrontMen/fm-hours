
export const state = () => ({
    customers: undefined,
});

export const actions = {
    async getCustomers (context) {
        const ref = this.$fire.firestore.collection('customers');
        const customers = await ref.get();
        const mappedcustomers = customers.docs.map((res) => res.data());
        context.commit('getCustomersSuccess', mappedcustomers)
    },
}

export const mutations = {
    getCustomersSuccess(state, payload) {
        state.customers = payload;
    },
}