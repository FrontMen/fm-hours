import { GetterTree } from "vuex";
import {
  startOfISOWeek,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";

import { buildWeek, getWeekRange, getDateLabel } from "~/helpers/dates";

const getters: GetterTree<WeekDatesStoreState, RootStoreState> = {
  currentWeekLabel: (_, getters) => {
    const currentWeek = getters.currentWeek;
    const firstDay = currentWeek[0];
    const { start, end } = getWeekRange(firstDay.date);

    return getDateLabel(start, end);
  },

  currentWeek: (state, _, __, rootGetters) => {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    const holidays = rootGetters["holidays/getHolidayDates"];

    return buildWeek(startDate, holidays);
  },

  // Get date values relative to today.
  getRelativePosition(_, getters) {
    const startDate = new Date(getters.getCurrentWeekRange.startDate);
    const today = new Date();

    return {
      weekDifference: differenceInCalendarWeeks(startDate, today, {
        weekStartsOn: 1,
      }),
      monthDifference: differenceInCalendarMonths(startDate, today),
    };
  },

  getCurrentWeekRange: (_, getters) => {
    const currWeek = getters.currentWeek;
    return { startDate: currWeek[0].date, endDate: currWeek[6].date };
  },
};

export default getters;
