import {MutationTree} from 'vuex';

const mutations: MutationTree<RecordsStoreState> = {
  setRecords(
    state,
    payload: {
      timeRecords: TimeRecord[];
    }
  ) {
    state.timeRecords = payload.timeRecords || [];
  },
};

export default mutations;
