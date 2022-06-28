import type {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, payload: {employee: Employee; isAdmin: boolean}) => {
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
  },
  setNotFound: (state, payload: boolean) => {
    state.isFound = payload;
  },
};

export default mutations;
