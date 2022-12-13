import type {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  set: (state, payload: {employee: Employee}) => {
    state.employee = payload.employee;
  },
  isFound: (state, payload: boolean) => {
    state.isFound = payload;
  },
};

export default mutations;
