import {ActionTree} from 'vuex/types/index';

const actions: ActionTree<AuthStoreState, RootStoreState> = {
  async login({commit}) {
    try {
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        'saml.intracto'
      );
      const {user} = await this.$fire.auth.signInWithPopup(provider);
      console.log('login user', user);
      if (user) {
        const {uid, email, emailVerified, displayName, photoURL} = user;

        commit('setUser', {
          uid,
          email,
          emailVerified,
          displayName,
          photoURL,
        });
        return true;
      }
    } catch (error) {
      console.error(error);
    }
  },

  async logout({commit}) {
    await this.$fire.auth.signOut();
    commit('setLoading', false);
    commit('resetUser');
    return true;
  },

  onAuthStateChangedAction({commit}, {authUser}) {
    console.log('onAuthStateChangedAction');
    console.log('authuser', authUser);
    if (!authUser) {
      commit('resetUser');
      return;
    }

    const {uid, email, emailVerified, displayName, photoURL} = authUser;

    commit('setUser', {
      uid,
      email,
      emailVerified,
      displayName,
      photoURL,
    });
  },
};

export default actions;
