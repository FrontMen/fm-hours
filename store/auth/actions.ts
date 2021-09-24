import {ActionTree} from 'vuex/types/index';
import {extractUserFromAuthUser} from '~/helpers/auth';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login({dispatch}) {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        'saml.intracto'
      );
      const {user} = await this.$fire.auth.signInWithPopup(provider);

      if (user) {
        await dispatch('_saveUser', user);
        return true;
      }
    } catch (error: any) {
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

    await dispatch('_saveUser', authUser);

    if (!process.server) dispatch('employee/getEmployee', {}, {root: true});
  },

  /**
   * Internals
   */
  async _saveUser({commit}, authUser) {
    // 1. extract user data from auth
    const user = await extractUserFromAuthUser(authUser);

    // 2. check if it has userId
    if (!user.bridgeUid) {
      // TODO: maybe revert auth-service deletion and move this call there
      // 3. if not, calls /api/user/me with samlToken to retried bridgeUid
      const {data} = await this.$axios.get<{bridgeUid: number}>(
        '/api/user/me',
        {
          headers: {Authorization: user.samlToken},
        }
      );

      // 3.1 assigns bridgeUid to the user who's gonna be saved
      user.bridgeUid = data.bridgeUid;

      // 3.1 saves that bridgeUid to user (employee) with Firebase
      // TODO: implement that
    }

    commit('setUser', user);
  },
};

export default actions;
