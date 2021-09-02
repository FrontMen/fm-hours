import {MutationTree} from 'vuex';

const mutations: MutationTree<AuthStoreState> = {
  ON_AUTH_STATE_CHANGED_MUTATION: (state, {authUser}) => {
    if (!authUser) {
      state.user = undefined;
      return;
    }

    const {uid, email, emailVerified, displayName, photoURL} = authUser;

    state.user = {
      uid,
      displayName,
      email,
      emailVerified,
      photoURL: photoURL || null,
    };
  },

  setUser: (state, user: User) => {
    state.isLoggedIn = true;
    state.user = user;
  },

  resetUser: (state) => {
    state.isLoggedIn = false;
    state.user = undefined;
  },

  setLoading: (state, payload: boolean) => {
    state.isLoading = payload;
  },

  setErrorMessage: (state, payload: string) => {
    state.errorMessage = payload;
  },
};

export default mutations;
