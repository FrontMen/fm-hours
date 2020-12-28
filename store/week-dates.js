import {
  subDays,
  startOfISOWeek,
  format,
  isSameDay,
  isWeekend,
  isToday,
  compareAsc,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { addDays, formatDate } from "../helpers/dates.js";

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
    const lastDay = currentWeek[6];
    let label = format(new Date(firstDay.date), "dd");
    if (firstDay.month !== lastDay.month) {
      label += ` ${format(new Date(firstDay.date), "MMM")}`;

      if (firstDay.year !== lastDay.year) {
        label += ` ${format(new Date(firstDay.date), "yyyy")}`;
      }
    }
    label += ` - ${format(new Date(lastDay.date), "dd MMM yyyy")}`;
    return label;
  },
  /* eslint-disable @typescript-eslint/no-unused-vars */
  currentWeek: (state, getters, _, rootGetters) => {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    const holidays = rootGetters["holidays/getHolidayDates"];
    return [...Array(7)].map((_, index) => {
      const newDate = addDays(startDate, index);
      return {
        date: formatDate(newDate),
        weekDay: format(newDate, "E"),
        weekDayShort: format(newDate, "EEEEEE"),
        monthDay: format(newDate, "dd"),
        month: format(newDate, "MMM"),
        year: format(newDate, "yyyy"),
        isWeekend: isWeekend(newDate),
        isToday: isToday(newDate),
        isHoliday: holidays.some((date) => isSameDay(new Date(date), newDate)),
      };
    });
  },
  // Get date values relative to today.
  getRelativePosition(_, getters) {
    const startDate = new Date(getters.getCurrentWeekRange.startDate);
    const today = new Date();
    return {
      weekDifference: differenceInCalendarWeeks(startDate, today, { weekStartsOn: 1 }),
      monthDifference: differenceInCalendarMonths(startDate, today),
    };
  },
  getCurrentWeekRange: (_, getters) => {
    const currWeek = getters.currentWeek;
    return { startDate: currWeek[0].date, endDate: currWeek[6].date };
  },
};
