import {ActionTree} from 'vuex/types';

const actions: ActionTree<TeamsStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (rootState.teams.teams?.length) return;

    const teams = await this.app.$teamsService.getAll();

    commit('set', teams);
  },
  async add({commit}, payload: Omit<Team, 'id'>) {
    const newTeam = await this.app.$teamsService.add(payload);
    commit('add', newTeam);
  },
  async update({commit}, payload: Team) {
    await this.app.$teamsService.update(payload);
    commit('update', payload);
  },
  async delete({commit}, payload: Team) {
    await this.app.$teamsService.delete(payload.id);
    commit('delete', payload);
  },
  async archive({commit}, payload: Team) {
    const updated = {...payload, archived: true};
    await this.app.$teamsService.update(updated);
    commit('update', updated);
  },
  async unarchive({commit}, payload: Team) {
    const updated = {...payload, archived: false};
    await this.app.$teamsService.update(updated);
    commit('update', updated);
  },
};

export default actions;
