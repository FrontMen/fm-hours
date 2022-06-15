import {GetterTree} from 'vuex';

const getters: GetterTree<AuthStoreState, RootStoreState> = {
  isAuthenticated(state) {
    return !!state.user && !!state.user.uid;
  },
};

export default getters;
