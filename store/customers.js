import { resetAutoDestroyState } from '@vue/test-utils';
import { CreateSelectOptions } from '../helpers/create-select-options';
import {CreateEntities} from '../helpers/create-entities';

export const state = () => ({
    customers: {},
    projects: {}
});

export const actions = {
    async getCustomers (context) {
        const ref = this.$fire.firestore.collection('customers');
        const customers = await ref.get();
        const customersEntities = CreateEntities(customers.docs, (entities, res) => {
            return {
                ...entities,
                [res.id]: {
                    id: res.id,
                    ...res.data(),
                }
            }
        });
        context.commit('getCustomersSuccess', customersEntities)
    },
    async getCustomersProjects (context, payload) {
        const customerProjects = context.getters.getProjects;
        if (!customerProjects[payload]) {
            const ref = this.$fire.firestore.collection(`customers/${payload}/projects`);
            let projects = (await ref.get()).docs.map((res) => ({id: res.id, ...res.data()}));
            context.commit('getProjectsForCustomerSuccess', {id: payload, projects });
        }
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
}

export const getters = {
    getCustomersEntities: state => {
        return state.customers;
    },
    getCustomersArray: state => {
        return Object.keys(state.customers).map((key) => state.customers[key]);
    },
    getProjects: (state) => {
        return state.projects;
    },
}