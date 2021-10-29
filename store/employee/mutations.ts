import {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (
    state,
    payload: {employee: Employee; isAdmin: boolean; projects: Customer[]}
  ) => {
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
    state.projects = payload.projects;
  },
};

export default mutations;
