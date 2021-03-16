/* eslint-disable camelcase */
import { ActionTree } from "vuex";
import { recordStatus } from "~/helpers/record-status";

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getUserList({ commit }) {
    const timeRecords = await this.app.$timeRecordsService.getPendingOrDeniedRecords();
    // TODO: check travel records as well?

    const users = await this.app.$usersService.getUsers();

    const timesheetUsers = users.map((user) => {
      const hasPendingRecords = timeRecords.some(
        (record) =>
          record.userId === user.id && record.status === recordStatus.PENDING
      );

      const hasDeniedRecords = timeRecords.some(
        (record) =>
          record.userId === user.id && record.status === recordStatus.DENIED
      );

      return {
        ...user,
        status: hasPendingRecords
          ? recordStatus.PENDING
          : hasDeniedRecords
          ? recordStatus.DENIED
          : recordStatus.NEW,
      };
    });

    commit("setTimesheetUsers", { users: timesheetUsers });
  },
};

export default actions;
