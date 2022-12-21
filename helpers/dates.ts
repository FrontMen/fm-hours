import {
  format,
  isToday,
  isWeekend,
  startOfISOWeek,
  addWeeks,
  startOfYear,
  getDay,
  isBefore,
} from 'date-fns';

export function formatDate(dirtyDate: string | number | Date) {
  const date = new Date(dirtyDate);

  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

export function formatToMonthYear(date: Date): string {
  return format(date, 'MM-yyyy');
}

export function addDays(dirtyDate: string | number | Date, days: number) {
  const date = new Date(dirtyDate);
  date.setDate(date.getDate() + days);

  return date;
}

// Build a week based on a startDate.
export function buildWeek(startDate: string | number | Date): WeekDate[] {
  return [...Array(7)].map((_, index) => {
    const newDate = addDays(startDate, index);

    return {
      date: formatDate(newDate),
      weekDay: format(newDate, 'E'),
      weekDayShort: format(newDate, 'EEEEEE'),
      monthDay: format(newDate, 'dd'),
      month: format(newDate, 'MMM'),
      year: format(newDate, 'yyyy'),
      isWeekend: isWeekend(newDate),
      isToday: isToday(newDate),
      isHoliday: false,
      isLeaveDay: false,
      isPartTime: false,
    };
  });
}

export function checkNonWorkingDays(days: WeekDate[], workScheme?: WorkScheme[]): WeekDate[] {
  return days.map(day => {
    const workSchemeDay = workScheme?.find(ws => ws.date === day.date);
    const isPublicHoliday = !!workSchemeDay?.holiday;
    // Holidays also register absence hours, prevent double label.
    const isLeaveDay = !!workSchemeDay?.absenceHours && !isPublicHoliday;

    const isPartTime = !isPublicHoliday && !!workSchemeDay && workSchemeDay.theoreticalHours < 8;

    return {
      ...day,
      isHoliday: isPublicHoliday,
      isLeaveDay,
      isPartTime,
    };
  });
}

function buildWeekSpan(startDate: Date) {
  const start = startOfISOWeek(startDate);
  const end = addDays(start, 6);

  return {
    start: {
      date: start.getTime(),
      formatedDate: format(start, 'dd/MMM'),
      ISO: formatDate(start),
    },
    end: {
      date: end.getTime(),
      formatedDate: format(end, 'dd/MMM'),
      ISO: formatDate(end),
    },
  };
}

export function getWeeksInMonth(startDate: Date, endDate: Date): WeekSpan[] {
  const weeksSpan = [buildWeekSpan(startDate)];

  let failSafe = 0;
  // @ts-ignore
  while (isBefore(weeksSpan.at(-1).end.date, endDate) && failSafe < 10) {
    // @ts-ignore
    weeksSpan.push(buildWeekSpan(addDays(weeksSpan.at(-1).end.date, 1)));
    failSafe += 1;
  }

  return weeksSpan;
}

// Due to timezones, the timestamps or other date formats can be referencing the wrong day.
// To guarantee that we are always referencing to the same date, we use GMT as a standard.
// This function will adjust the date to the correct day.
export function getDayOnGMT(initialZonedValue: Date | number | string) {
  const MILLISECONDS_IN_MINUTES = 60000;
  const zonedDate = new Date(initialZonedValue);
  return new Date(zonedDate.getTime() + zonedDate.getTimezoneOffset() * MILLISECONDS_IN_MINUTES);
}

// TODO: refactor this because it is really unclear
export function getDateOfISOWeek(year: number, week: number, day: number) {
  const startDayOfYear = startOfYear(new Date(year, 0, 1));
  const diff = day - getDay(startDayOfYear);
  const firstAppearanceOfYear = addDays(startDayOfYear, diff < 0 ? 7 + diff : diff);
  return addWeeks(firstAppearanceOfYear, week - 1);
}
