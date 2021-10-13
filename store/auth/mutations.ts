import type {MutationTree} from 'vuex';

const mutations: MutationTree<AuthStoreState> = {
  setUser: (state, user: User) => {
    state.user = user;
  },

  resetUser: (state) => {
    state.user = undefined;
  },

  setLoading: (state, payload: boolean) => {
    state.isLoading = payload;
  },

  setErrorMessage: (state, payload: string) => {
    state.errorMessage = payload;
  },
};

export default mutations;
