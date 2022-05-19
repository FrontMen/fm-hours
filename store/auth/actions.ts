import {ActionTree} from 'vuex';
import {extractUserFromAuthUser} from '~/helpers/auth';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login() {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider('saml.intracto');
      await this.$fire.auth.signInWithPopup(provider);
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

    await dispatch('employee/getEmployee', {}, {root: true});
    // @ts-ignore
    this.$router.push(this.localePath('/'));
  },
};

export default actions;
