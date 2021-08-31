import {MutationTree} from 'vuex';

const mutations: MutationTree<AuthStoreState> = {
  ON_AUTH_STATE_CHANGED_MUTATION: (state, {authUser}) => {
    console.log('ON_AUTH_STATE_CHANGED_MUTATION');
    if (!authUser) {
      console.log('mutations no auth user');
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
    console.log('mutations user payload', user);
    state.isLoggedIn = true;
    state.user = user;
    // state.isAdmin = payload.isAdmin;
  },

  resetUser: (state) => {
    state.isLoggedIn = false;
    state.user = undefined;
    // state.isAdmin = false;
  },

  setLoading: (state, payload: boolean) => {
    state.isLoading = payload;
  },

  setErrorMessage: (state, payload: string) => {
    state.errorMessage = payload;
  },
};

export default mutations;
