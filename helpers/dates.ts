import {
  format,
  isToday,
  isWeekend,
  startOfISOWeek,
  addWeeks,
  getISOWeek,
} from "date-fns";

export function formatDate(dirtyDate: string | number | Date) {
  const date = new Date(dirtyDate);

  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(dirtyDate: string | number | Date, days: number) {
  const date = new Date(dirtyDate);
  date.setDate(date.getDate() + days);

  return date;
}

// based on a date, create a label with the begin and enddate of that week
export function getDateLabel(startDate: Date, endDate: Date) {
  let label = format(startDate, "dd");

  if (startDate.getMonth() !== endDate.getMonth()) {
    label += ` ${format(startDate, "MMM")}`;

    if (startDate.getFullYear() !== endDate.getFullYear()) {
      label += ` ${format(startDate, "yyyy")}`;
    }
  }

  label += ` - ${format(endDate, "dd MMM yyyy")}`;
  return `${label} (week: ${getISOWeek(startDate)})`;
}

// Build a week based on a startDate.
export function buildWeek(startDate: string | number | Date): WeekDate[] {
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
      isHoliday: false,
      isLeaveDay: false,
    };
  });
}

export function checkNonWorkingDays(
  days: WeekDate[],
  customHolidays: string[],
  workScheme?: WorkScheme[]
) {
  return days.map((day) => {
    const isCustomHoliday = customHolidays.includes(day.date);

    const workSchemeDay = workScheme?.find((ws) => ws.date === day.date);
    const isPublicHoliday = !!workSchemeDay?.holiday;
    const isLeaveDay = !!workSchemeDay?.absenceHours;

    return {
      ...day,
      isHoliday: isCustomHoliday || isPublicHoliday,
      isLeaveDay,
    };
  });
}

// Based on a date, return the begindate of that week and the enddate of that week
// return in this format so its usable for date-fns, which need the js new Date object.
// wrap it in the format function to get rid of the hours
export function getWeekRange(beginDate: string) {
  const start = startOfISOWeek(getDayOnGMT(beginDate));
  const end = addDays(start, 6);
  return { start, end };
}

function buildWeekSpan(startDate: Date) {
  const start = startOfISOWeek(startDate);
  const end = addDays(start, 6);

  return {
    start: {
      date: start.getTime(),
      formatedDate: format(start, "dd/MMM"),
      ISO: formatDate(start),
    },
    end: {
      date: end.getTime(),
      formatedDate: format(end, "dd/MMM"),
      ISO: formatDate(end),
    },
  };
}

export function getWeeksSpan(
  weeksBefore: number,
  weeksAfter: number
): WeekSpan[] {
  const totalWeeks = weeksBefore + weeksAfter + 1;
  const currentWeekSpan = buildWeekSpan(new Date());

  const weeksSpan = Array.from(Array(totalWeeks)).map((_, index) => {
    const weeksDiff = index - weeksBefore;

    if (!weeksDiff) {
      return currentWeekSpan;
    }

    return buildWeekSpan(addWeeks(currentWeekSpan.start.date, weeksDiff));
  });

  return weeksSpan;
}

// Due to timezones, the timestamps or other date formats can be referencing the wrong day.
// To guarantee that we are always referencing to the same date, we use GMT as a standard.
// This function will adjust the date to the correct day.
export function getDayOnGMT(initialZonedValue: Date | number | string) {
  const MILLISECONDS_IN_MINUTES = 60000;
  const zonedDate = new Date(initialZonedValue);
  return new Date(
    zonedDate.getTime() +
      zonedDate.getTimezoneOffset() * MILLISECONDS_IN_MINUTES
  );
}
