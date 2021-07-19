
import { GetterTree } from "vuex";

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  adminList(state): string[] {
    return state.adminList;
  },
  teamList(state): string[] {
    return state.teamList;
  },
};

export default getters;
