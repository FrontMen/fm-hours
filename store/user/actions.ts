/* eslint-disable camelcase */
import { ActionTree } from "vuex";

const actions: ActionTree<UserStoreState, RootStoreState> = {
  async login() {
    const provider = new this.$fireModule.auth.GoogleAuthProvider();
    await this.$fire.auth.signInWithPopup(provider);
  },

  logout({ commit }) {
    this.$fire.auth.signOut();
    this.app.router?.push("/");

    commit("resetUser");
  },

  async onAuthStateChanged(
    { commit },
    payload: { authUser?: any; claims?: any }
  ) {
    if (!payload.authUser) return;

    const user = await this.app.$usersService.getUser(payload.claims.user_id);
    const isAdmin = await this.app.$usersService.isAdmin(payload.claims.email);

    if (user) {
      commit('setUser', { ...user, isAdmin })
    } else {
      const newUser = await this.app.$usersService.createUser({
        userId: payload.claims.user_id,
        name: payload.claims.name,
        picture: payload.claims.picture,
      })

      commit('setUser', { ...newUser, isAdmin })
    }
  },
};

export default actions;
