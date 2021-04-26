import { isWithinInterval, startOfISOWeek } from "date-fns";
import { GetterTree } from "vuex";

import { buildWeek } from "~/helpers/dates";

const getters: GetterTree<TimesheetsStoreState, RootStoreState> = {
  getEmployeePendingTimeRecords(state) {
    const employee = state.employees.find(
      (employee) => employee.id === state.selectedEmployeeId
    );
    return employee ? employee.pendingTimeRecords : [];
  },

  getEmployeePendingTravelRecords(state) {
    const employee = state.employees.find(
      (employee) => employee.id === state.selectedEmployeeId
    );
    return employee ? employee.pendingTravelRecords : [];
  },

  getEmployeePendingWeeks(state, _, rootState) {
    const employee = state.employees.find(
      (employee) => employee.id === state.selectedEmployeeId
    );
    if (!employee) return [];

    const pendingWeeks = [];
    const holidays = rootState.holidays.holidays;

    let pendingRecords = [
      ...employee.pendingTimeRecords,
      ...employee.pendingTravelRecords,
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
  },
};

export default getters;
