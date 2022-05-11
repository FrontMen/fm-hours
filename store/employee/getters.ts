import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeeStoreState, RootStoreState> = {
  error(state) {
    return state.error;
  },
};

export default getters;
