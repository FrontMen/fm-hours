import {ActionTree} from 'vuex';

export const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async nuxtServerInit({dispatch}, {res}) {
    if (res && res.locals && res.locals.user) {
      console.log('ssr user', res.locals.user);
      const {allClaims: claims, ...authUser} = res.locals.user;

      await dispatch('employee/onAuthStateChanged', {
        authUser,
        claims,
      });
    }
  },
};
