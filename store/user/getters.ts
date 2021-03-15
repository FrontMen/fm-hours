import { GetterTree } from "vuex";

const getters: GetterTree<UserStoreState, RootStoreState> = {
  isUserLoggedIn(state): boolean {
    return state.isLoggedIn;
  },

  isUserAdmin(state): boolean {
    return state.isAdmin;
  },
};

export default getters;
