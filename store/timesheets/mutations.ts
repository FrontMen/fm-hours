import { MutationTree } from "vuex";

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetUsers: (state, payload: { users: TimesheetUser[] }) => {
    state.users = payload.users;
  },
};

export default mutations;
