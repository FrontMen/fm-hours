import {
  format,
  isToday,
  isWeekend,
  isSameDay,
  startOfISOWeek,
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
  return label;
}

// Build a week based on a startDate.
export function buildWeek(
  startDate: string | number | Date,
  holidays: string[]
): WeekDate[] {
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
}

// Based on a date, return the begindate of that week and the enddate of that week
// return in this format so its usable for date-fns, which need the js new Date object.
// wrap it in the format function to get rid of the hours
export function getWeekRange(beginDate: string) {
  const start = startOfISOWeek(new Date(beginDate));
  const end = addDays(start, 6);
  return { start: new Date(formatDate(start)), end: new Date(formatDate(end)) };
}
