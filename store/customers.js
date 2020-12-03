import { resetAutoDestroyState } from '@vue/test-utils';
import { CreateSingleSelectOption, CreateDefaultSelectOption } from '../helpers/create-select-options';

export const state = () => ({
    customers: {},
    projects: {},
    selectedCustomer: null,
    customerToAdd: {
        customer: null,
        project: null,
    }
});

export const actions = {
    async getCustomers (context) {
        const ref = this.$fire.firestore.collection('customers');
        const customers = await ref.get();
        const customersEntities = customers.docs.map((res) => ({id: res.id, ...res.data()}));
        context.commit('getCustomersSuccess', customersEntities)
    },
    selectCustomerToAdd (context, payload) {
        context.commit('selectCustomerToAdd', payload);
        context.dispatch('selectCustomerToAddProject', payload);
    },
    async selectCustomerToAddProject (context, payload) {
        const customerProjects = context.getters.getProjects;
        if (customerProjects[payload]) {
            return;
        }
        const ref = this.$fire.firestore.collection(`customers/${payload}/projects`);
        let projects = (await ref.get()).docs.map((res) => ({id: res.id, ...res.data()}));
        context.commit('getProjectsForCustomerSuccess', {id: payload, projects });
    },
}

export const mutations = {
    getCustomersSuccess(state, payload) {
        state.customers = payload;
    },
    getProjectsForCustomerSuccess(state, {id, projects}) {
        state.projects = {
            ...state.projects,
            [id]: projects
        };
    },
    selectCustomerToAdd(state, payload) {
        state.customerToAdd.customer = payload;
        state.customerToAdd.project = null;
    },
    selectCustomerToAddProject(state, payload) {
        state.customerToAdd.project = payload;
    },
    resetCustomerToAdd(state) {
        state.customerToAdd.customer = null;
        state.customerToAdd.project = null;
    },
}

export const getters = {
    getCustomers: state => {
        return state.customers;
    },
    getCustomerToAdd: (state) => {
        return state.customerToAdd;
    },
    getProjects: (state) => {
        return state.projects;
    },
    getSelectableProjects: (state, getters, rootState, rootGetters) => {
        const projects = getters.getProjects;
        const getSelectedCustomer = getters.getCustomerToAdd.customer;
        const currentRows = rootGetters['user/getTimeRecordsForCurrentWeek'];
        const projectsByCustomer = projects[getSelectedCustomer];
        const defaultSelectOption = CreateDefaultSelectOption('Select an project');
        if (!projectsByCustomer) {
            return [defaultSelectOption];
        }
        const newOptions = projectsByCustomer.map((entry) => {
            return CreateSingleSelectOption(entry.id, entry.name, currentRows.some((row) => row.project === entry.name));
        });
        return [defaultSelectOption, ...newOptions];
    },
}