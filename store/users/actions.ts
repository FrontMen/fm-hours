import { ActionTree } from "vuex";

const actions: ActionTree<UsersStoreState, RootStoreState> = {
  async getUsers({ commit }) {
    const users = await this.app.$usersService.getUsers();
    commit("setUsers", { users });
  },

  async toggleActive({ commit }, payload: User) {
    const newUser = { ...payload, active: !payload.active };
    await this.app.$usersService.updateUser(newUser);

    commit("updateUser", { user: newUser });
  },

  async toggleTravelAllowance({ commit }, payload: User) {
    const newUser = { ...payload, travelAllowance: !payload.travelAllowance };
    await this.app.$usersService.updateUser(newUser);

    commit("updateUser", { user: newUser });
  },

  async saveProjects(
    { commit },
    payload: { user: User; customerIds: string[] }
  ) {
    const newUser = { ...payload.user, projects: payload.customerIds };
    await this.app.$usersService.updateUser(newUser);

    commit("updateUser", { user: newUser });
  },
};

export default actions;
