import {ActionTree} from 'vuex/types/index';

export const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async nuxtServerInit({dispatch}, {res}) {
    if (res && res.locals && res.locals.user) {
      await dispatch('auth/onAuthStateChangedAction', {
        authUser: res.locals.user,
      });
    }
  },
};
