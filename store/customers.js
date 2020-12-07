import { CreateSingleSelectOption, CreateDefaultSelectOption } from '../helpers/create-select-options';

export const state = () => ({
    customers: [],
    selectedCustomer: null,
});

export const actions = {
    async addNewCustomer (context, payload) {
        const ref = this.$fire.firestore.collection('customers');
        const { id } = await ref.add(payload);
        context.commit('addNewCustomerSuccess', {
            ...payload,
            id
        });
    },
    async getCustomers (context) {
        const ref = this.$fire.firestore.collection('customers');
        const customers = await ref.get();
        const customersEntities = customers.docs.map((res) => ({id: res.id, ...res.data()}));
        context.commit('getCustomersSuccess', customersEntities)
    },
}

export const mutations = {
    getCustomersSuccess(state, payload) {
        state.customers = payload;
    },
    addNewCustomerSuccess(state, payload) {
        state.customers = [...state.customers, payload];
    },
}

export const getters = {
    getCustomers: state => {
        return state.customers;
    },
    getSelectableCustomers: (state, getters, rootState, rootGetters) => {
        const currentRows = rootGetters['user/getTimeRecordsForCurrentWeek'];
        const customerList = getters.getCustomers;
        const defaultSelectOption = CreateDefaultSelectOption('Select a customer');
        const newOptions = customerList.map((entry) => {
            return CreateSingleSelectOption(entry.id, entry.name, currentRows.some((row) => row.customer === entry.name));
        });
        return [defaultSelectOption, ...newOptions];
    }
}