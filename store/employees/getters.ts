import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  adminList(state): string[] {
    return state.adminList;
  },
};

export default getters;
