import {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, payload: {employee: Employee; isAdmin: boolean}) => {
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
  },

  resetEmployee: (state) => {
    state.employee = null;
  },
};

export default mutations;
