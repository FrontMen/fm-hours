import { GetterTree } from "vuex";

import { recordStatus } from "~/helpers/record-status";
import {
  getRecordsForWeekRange,
  generateWeeklyValuesForTable,
} from "~/helpers/records";

// TODO: delete this file
const getters: GetterTree<RecordsStoreState, RootStoreState> = {
  getTimeRecordsForCurrentWeek: (state, _, __, rootGetters) => {
    const records = state.timeRecords;
    const { startDate, endDate } = rootGetters[
      "week-dates/getCurrentWeekRange"
    ];

    return getRecordsForWeekRange(records, startDate, endDate);
  },

  getWeeklyTimesheet: (_, getters, __, rootGetters) => {
    const currentWeek = rootGetters["week-dates/currentWeek"];
    const records = getters.getTimeRecordsForCurrentWeek;

    return generateWeeklyValuesForTable(records, currentWeek);
  },

  currentWeekIsReadOnly: (_, getters) => {
    const records = getters.getTimeRecordsForCurrentWeek as TimeRecord[];

    return records.some(
      (record) =>
        record.status === recordStatus.PENDING ||
        record.status === recordStatus.APPROVED
    );
  },
};

export default getters;
