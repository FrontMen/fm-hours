import {MutationTree} from 'vuex';

const mutations: MutationTree<TeamsStoreState> = {
  set: (state, payload: Team[]) => {
    state.teams = payload;
  },
  add(state, payload: Team) {
    state.teams = [...state.teams, payload];
  },
  update: (state, payload: Team) => {
    state.teams = state.teams.map(team => (team.id === payload.id ? payload : team));
  },
};

export default mutations;
