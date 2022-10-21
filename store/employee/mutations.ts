import type {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, employee: Employee) => {
    state.employee = employee;
    state.isAdmin = employee.isAdmin;
  },
  setIsFound: (state, payload: boolean) => {
    state.isFound = payload;
  },
};

export default mutations;
