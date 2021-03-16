/* eslint-disable camelcase */
import { ActionTree } from "vuex";

import { recordStatus } from "~/helpers/record-status";
import {
  getTimeRecordsToSave,
  getTravelRecordsToSave,
} from "~/helpers/timesheet";

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

  selectUser({ commit }, payload: { userId: string }) {
    commit("setSelectedUserId", { userId: payload.userId });
  },

  async saveTimesheet(
    { state, commit },
    payload: {
      userId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
      status: RecordStatus;
    }
  ) {
    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    await this.app.$timeRecordsService.saveUserRecords({
      userId: payload.userId,
      timeRecords: timeRecordsToSave,
    });

    await this.app.$travelRecordsService.saveUserRecords({
      userId: payload.userId,
      travelRecords: travelRecordsToSave,
    });

    commit("setTimesheetUsers", {
      users: state.users.map((user) => {
        if (user.id !== payload.userId) return user;

        return {
          ...user,
          pendingTimeRecords: user.pendingTimeRecords.filter(
            (x) => !timeRecordsToSave.some((y) => y.id === x.id)
          ),
          pendingTravelRecords: user.pendingTimeRecords.filter(
            (x) => !travelRecordsToSave.some((y) => y.id === x.id)
          ),
        };
      }),
    });
  },
};

export default actions;
