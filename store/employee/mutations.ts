import {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeeStoreState> = {
  setEmployee: (state, payload: {employee: Employee; isAdmin: boolean}) => {
    state.isLoggedIn = true;
    state.employee = payload.employee;
    state.isAdmin = payload.isAdmin;
  },

  resetEmployee: (state) => {
    state.isLoggedIn = false;
    state.isAdmin = false;
    state.employee = null;
  },

  setLoading: (state, payload: boolean) => {
    state.isLoading = payload;
  },

  setErrorMessage: (state, payload: string) => {
    state.errorMessage = payload;
  },
};

export default mutations;
