import { MutationTree } from "vuex";

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetUsers: (state, payload: { users: TimesheetUser[] }) => {
    state.users = payload.users;
  },

  setSelectedUserId: (state, payload: { userId: string }) => {
    state.selectedUserId = payload.userId;
  },
};

export default mutations;
