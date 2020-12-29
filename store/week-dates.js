import {
  subDays,
  startOfISOWeek,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { addDays, buildWeek, getWeekRange, getDateLabel } from "../helpers/dates.js";

export const state = () => ({
  currentDate: new Date(),
});

export const mutations = {
  setToday(state) {
    state.currentDate = new Date();
  },
  nextWeek(state) {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    state.currentDate = addDays(startDate, 7);
  },
  prevWeek(state) {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    state.currentDate = subDays(new Date(startDate), 7);
  },
};

export const getters = {
  currentWeekLabel: (_, getters) => {
    const currentWeek = getters.currentWeek;
    const firstDay = currentWeek[0];
    const { start, end } = getWeekRange(firstDay.date);
    return getDateLabel(start, end);
  },
  /* eslint-disable @typescript-eslint/no-unused-vars */
  currentWeek: (state, getters, _, rootGetters) => {
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
