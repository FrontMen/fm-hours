import {MutationTree} from 'vuex';

const mutations: MutationTree<TeamsStoreState> = {
  set: (state, payload: Team[]) => {
    state.teams = payload;
  },
};

export default mutations;
