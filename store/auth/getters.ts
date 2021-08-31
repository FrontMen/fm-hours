import {GetterTree} from 'vuex';

const getters: GetterTree<AuthStoreState, RootStoreState> = {
  isAuthenticated(state) {
    return !!state.user && !!state.user.uid;
  },
  isUserLoggedIn(state): boolean {
    return state.isLoggedIn;
  },

  // isEmployeeAdmin(state): boolean {
  //     return state.isAdmin;
  // },
};

export default getters;
