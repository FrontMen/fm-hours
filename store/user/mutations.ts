import { MutationTree } from "vuex";

const mutations: MutationTree<UserStoreState> = {
  setUser: (state, payload: { user: User; isAdmin: boolean }) => {
    state.isLoggedin = true;
    state.user = payload.user;
    state.isAdmin = payload.isAdmin;
  },

  resetUser: (state) => {
    state.isLoggedin = false;
    state.isAdmin = false;
    state.user = null;
  },
};

export default mutations;
