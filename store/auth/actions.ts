import {ActionTree} from 'vuex';
import {extractUserFromAuthUser} from '~/helpers/auth';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login({commit}) {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider('saml.intracto');
      const {user} = await this.$fire.auth.signInWithPopup(provider);

      if (user) {
        commit('setUser', await extractUserFromAuthUser(user));
        return true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong while Login');
      throw error;
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

    const user = await extractUserFromAuthUser(authUser);
    commit('setUser', user);

    try {
      await this.$axios.$get('/api/bridge/auth', {
        headers: {Authorization: user?.samlToken || ''},
      });
    } catch {
      const authState = await dispatch('logout');
      if (authState) {
        // @ts-ignore
        this.$router.push(this.localePath('/login'));
      }
    }

    await dispatch('employee/get', {}, {root: true});
  },
};

export default actions;
