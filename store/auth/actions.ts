import {ActionTree} from 'vuex/types/index';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login({commit}) {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        'saml.intracto'
      );
      const {user} = await this.$fire.auth.signInWithPopup(provider);

      if (user) {
        const {uid, email, emailVerified, displayName, photoURL} = user;

        commit('setUser', {
          uid,
          email,
          emailVerified,
          displayName,
          photoURL,
          // TODO: fixme
          samlToken: (user as any).b.b.a,
        });
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

  onAuthStateChangedAction({commit, dispatch}, {authUser}) {
    if (!authUser) {
      commit('resetUser');
      return;
    }

    const {uid, email, emailVerified, displayName, photoURL} = authUser;

    const user = {
      uid,
      email,
      emailVerified,
      displayName,
      photoURL,
      samlToken: undefined,
    };

    /**
     * On server side we don't have this information but we ALWAYS have it
     * client side.
     */
    if (!process.server) {
      user.samlToken = (authUser as any).b.b.g;
    }

    commit('setUser', user);

    if (!process.server) dispatch('employee/getEmployee', {}, {root: true});
  },
};

export default actions;
