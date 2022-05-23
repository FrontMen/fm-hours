import {GetterTree} from 'vuex';

const getters: GetterTree<AuthStoreState, RootStoreState> = {
  isAuthenticated(state) {
    return !!state.user && !!state.user.uid;
  },
  user(state) {
    return state.user;
  },
};

export default getters;
