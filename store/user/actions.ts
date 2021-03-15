/* eslint-disable camelcase */
import { ActionTree } from "vuex";
import UsersService from "~/services/users-service";

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

    const usersService = new UsersService(this.$fire);
    const user = await usersService.getUser(payload.claims.user_id);
    const isAdmin = await usersService.isAdmin(payload.claims.email);

    if (user) {
      commit("setUser", { user, isAdmin });
    } else {
      const newUser = await usersService.createUser({
        userId: payload.claims.user_id,
        name: payload.claims.name,
        picture: payload.claims.picture,
      });

      commit("setUser", { user: newUser, isAdmin });
    }
  },
};

export default actions;
