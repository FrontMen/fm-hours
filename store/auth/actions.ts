import {ActionTree} from 'vuex/types/index';
import {extractUserFromAuthUser} from '~/helpers/auth';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login({commit}) {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        'saml.intracto'
      );
      const {user} = await this.$fire.auth.signInWithPopup(provider);

      if (user) {
        commit('setUser', await extractUserFromAuthUser(user));
        return true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong while Login');
      throw new Error(error);
    }
  },

  async logout({commit}) {
    await this.$fire.auth.signOut();
    commit('setLoading', false);
    commit('resetUser');
    return true;
  },

  /**
   * This actions is only called via Nuxt Firebase.
   */
  async onAuthStateChangedAction({commit, dispatch}, {authUser}) {
    if (!authUser) {
      commit('resetUser');
      return;
    }

    commit('setUser', await extractUserFromAuthUser(authUser));

    if (!process.server) dispatch('employee/getEmployee', {}, {root: true});
  },
};

export default actions;
