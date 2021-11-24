import {MutationTree} from 'vuex/types';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, payload: {employee: Employee; isAdmin: boolean}) => {
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
  },
};

export default mutations;
