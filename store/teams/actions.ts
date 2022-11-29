import {ActionTree} from 'vuex/types';

const actions: ActionTree<TeamsStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (rootState.teams.teams?.length) return;

    const teams = await this.app.$teamsService.get();

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
};

export default actions;
