import { isWithinInterval, startOfISOWeek } from "date-fns";
import { GetterTree } from "vuex";

import { buildWeek } from "~/helpers/dates";

const getters: GetterTree<TimesheetsStoreState, RootStoreState> = {
  getUserPendingTimeRecords(state) {
    return function (userId: string) {
      const user = state.users.find((user) => user.id === userId);
      return user ? user.pendingTimeRecords : [];
    };
  },

  getUserPendingTravelRecords(state) {
    return function (userId: string) {
      const user = state.users.find((user) => user.id === userId);
      return user ? user.pendingTravelRecords : [];
    };
  },

  getUserPendingWeeks(state, _, rootState) {
    return function (userId: string) {
      const user = state.users.find((user) => user.id === userId);
      if (!user) return [];

      const pendingWeeks = [];
      const holidays = rootState.holidays.holidays;

      let pendingRecords = [
        ...user.pendingTimeRecords,
        ...user.pendingTravelRecords,
      ];

      while (pendingRecords.length > 0) {
        const firstPendingRecord = pendingRecords[0];
        const firstPendingDate = startOfISOWeek(
          new Date(firstPendingRecord.date)
        );
        const pendingWeek = buildWeek(firstPendingDate, holidays);

        const start = new Date(pendingWeek[0].date);
        const end = new Date(pendingWeek[6].date);

        const isNotWithinPendingWeek = (record: TimeRecord | TravelRecord) =>
          !isWithinInterval(new Date(record.date), { start, end });

        pendingRecords = pendingRecords.filter(isNotWithinPendingWeek);
        pendingWeeks.push({ dates: pendingWeek });
      }

      return pendingWeeks;
    };
  },
};

export default getters;
