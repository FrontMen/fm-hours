import type {MutationTree} from 'vuex';

const mutations: MutationTree<AuthStoreState> = {
  ON_AUTH_STATE_CHANGED_MUTATION: (state, {authUser}) => {
    if (!authUser) {
      state.user = undefined;
      return;
    }

    const {uid, email, emailVerified, displayName, photoURL} = authUser;

    const user = {
      uid,
      displayName,
      email,
      emailVerified,
      photoURL: photoURL || null,
      // TODO: investigate why we're doing this logic twice
      samlToken: authUser.b.b.g,
    };

    state.user = user;
  },

  setUser: (state, user: User) => {
    state.user = user;
  },

  resetUser: (state) => {
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
