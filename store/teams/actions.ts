import {ActionTree} from 'vuex/types';

const actions: ActionTree<TeamsStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (rootState.teams.teams?.length) return;

    const teams = await this.app.$teamsService.getTeams();

    const covertedList = teams?.map((team: string) => ({
      id: team.toLowerCase(),
      name: team,
    }));

    commit('set', covertedList);
  },
};

export default actions;
