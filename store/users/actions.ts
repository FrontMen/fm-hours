import { ActionTree } from "vuex";

const actions: ActionTree<UsersStoreState, RootStoreState> = {
  async getUsers({ commit }) {
    const users = await this.app.$usersService.getUsers();
    commit("setUsers", { users });
  },

  async toggleTravelAllowance({ commit }, payload: User) {
    const newUser = { ...payload, travelAllowance: !payload.travelAllowance };
    await this.app.$usersService.updateUser(newUser);

    commit("updateUser", { user: newUser });
  },
};

export default actions;
