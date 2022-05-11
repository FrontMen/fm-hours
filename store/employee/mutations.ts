import type {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, payload: {employee: Employee; isAdmin: boolean}) => {
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
  },
  setError: (state, payload) => {
    state.error = payload;
  },
};

export default mutations;
