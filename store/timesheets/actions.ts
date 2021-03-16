/* eslint-disable camelcase */
import { ActionTree } from "vuex";
import { recordStatus } from "~/helpers/record-status";

const isPendingRecord = (record: TimeRecord | TravelRecord, userId: string) =>
  record.userId === userId && record.status === recordStatus.PENDING;

const isDeniedRecord = (record: TimeRecord | TravelRecord, userId: string) =>
  record.userId === userId && record.status === recordStatus.DENIED;

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getUserList({ commit }) {
    const timeRecords = await this.app.$timeRecordsService.getPendingOrDeniedRecords();
    const travelRecords = await this.app.$travelRecordsService.getPendingOrDeniedRecords();

    const users = await this.app.$usersService.getUsers();

    const timesheetUsers = users.map((user) => {
      const pendingTimeRecords = timeRecords.filter((record) =>
        isPendingRecord(record, user.id)
      );

      const pendingTravelRecords = timeRecords.filter((record) =>
        isPendingRecord(record, user.id)
      );

      const hasPendingRecords =
        pendingTimeRecords.length > 0 || pendingTravelRecords.length > 0;
      const hasDeniedRecords =
        timeRecords.some((record) => isDeniedRecord(record, user.id)) ||
        travelRecords.some((record) => isDeniedRecord(record, user.id));

      return {
        ...user,
        pendingTimeRecords,
        pendingTravelRecords,
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
