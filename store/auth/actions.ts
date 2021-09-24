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
        const userToCommit = await extractUserFromAuthUser(user);

        commit('setUser', userToCommit);

        return true;
      }
    } catch (error: any) {
      throw new Error(error);
    }
  },

  async logout({commit}) {
    await this.$fire.auth.signOut();
    commit('setLoading', false);
    commit('resetUser');
    return true;
  },

  async onAuthStateChangedAction({commit, dispatch}, {authUser}) {
    if (!authUser) {
      commit('resetUser');
      return;
    }

    const user = await extractUserFromAuthUser(authUser);

    commit('setUser', user);

    if (!process.server) dispatch('employee/getEmployee', {}, {root: true});
  },
};

export default actions;
