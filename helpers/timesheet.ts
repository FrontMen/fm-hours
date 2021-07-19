import { isSameDay, isWithinInterval, getISOWeek } from "date-fns";

import { recordStatus } from "./record-status";
import { getDayOnGMT, formatDate } from "./dates";

export const createWeeklyTimesheet = (params: {
  week: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  workScheme: WorkScheme[];
}): WeeklyTimesheet => {
  const start = new Date(params.week[0].date);
  const end = new Date(params.week[6].date);

  const isWithinCurrentWeek = (record: TimeRecord | TravelRecord) =>
    isWithinInterval(new Date(record.date), { start, end });

  const weeklyCustomers: Customer[] = [];
  const weeklyTimeRecords = params.timeRecords.filter(isWithinCurrentWeek);
  const weeklyTravelRecords = params.travelRecords.filter(isWithinCurrentWeek);

  weeklyTimeRecords.forEach((timeRecord) => {
    if (!weeklyCustomers.some((x) => x.id === timeRecord.customer.id)) {
      weeklyCustomers.push(timeRecord.customer);
    }
  });

  return {
    projects: createTimesheetProjects(
      params.week,
      weeklyCustomers,
      weeklyTimeRecords,
      params.workScheme
    ),
    travelProject: createTravelProject(params.week, weeklyTravelRecords),
  };
};

const createTimesheetProjects = (
  week: WeekDate[],
  customers: Customer[],
  timeRecords: TimeRecord[],
  workScheme: WorkScheme[]
): TimesheetProject[] => {
  const projects: TimesheetProject[] = [];

  const customerProjects = createCustomerProjects(week, customers, timeRecords);

  // TODO: enable this when the `workScheme` api has been implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const leaveProject = createLeaveProject(workScheme);
  // TODO: enable this when the `workScheme` api has been implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const absenceProject = createAbsceneProject(workScheme);

  if (customerProjects.length > 0) projects.push(...customerProjects);
  // TODO: enable this when the `workScheme` api has been implemented
  // if (leaveProject) projects.push(leaveProject);
  // TODO: enable this when the `workScheme` api has been implemented
  // if (absenceProject) projects.push(absenceProject);

  return projects;
};

const createLeaveProject = (
  workScheme: WorkScheme[]
): TimesheetProject | null => {
  const holidayHours = workScheme.map((scheme) => scheme.holiday);
  const hasHolidayHours = holidayHours.some((hours) => hours && hours > 0);

  if (hasHolidayHours) {
    return {
      customer: {
        id: "leaveProjectId",
        name: "Leave",
        debtor: "Frontmen",
        isBillable: false,
        isDefault: true,
      },
      values: holidayHours,
      ids: Array.from(Array(7), () => null),
      isExternal: true,
    };
  }

  return null;
};

const createAbsceneProject = (
  workScheme: WorkScheme[]
): TimesheetProject | null => {
  const absenceHours = workScheme.map((scheme) => scheme.absenceHours);
  const hasAbsenceHours = absenceHours.some((hours) => hours && hours > 0);

  if (hasAbsenceHours) {
    return {
      customer: {
        id: "absenceProjectId",
        name: "Absence",
        debtor: "Frontmen",
        isBillable: false,
        isDefault: false,
      },
      values: absenceHours,
      ids: Array.from(Array(7), () => null),
      isExternal: true,
    };
  }

  return null;
};

const createCustomerProjects = (
  week: WeekDate[],
  customers: Customer[],
  timeRecords: TimeRecord[]
): TimesheetProject[] => {
  return customers.map((customer) => {
    const projectRecords = timeRecords.filter(
      (x) => x.customer.id === customer.id
    );

    const values = week.map((weekDay) => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.hours || 0;
    });

    const ids = week.map((weekDay) => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.id || null;
    });

    return {
      customer,
      ids,
      values,
      isExternal: false,
    };
  });
};

const createTravelProject = (
  week: WeekDate[],
  travelRecords: TravelRecord[]
): TimesheetProject => {
  const values = week.map((weekDay) => {
    const record = findRecordByDate(weekDay, travelRecords) as TravelRecord;
    return record?.kilometers || 0;
  });

  const ids = week.map((weekDay) => {
    const record = findRecordByDate(weekDay, travelRecords) as TravelRecord;
    return record?.id || null;
  });

  return {
    customer: {
      id: "travelProjectId",
      name: "Kilometers",
      debtor: "Frontmen",
      isBillable: false,
      isDefault: false,
    },
    ids,
    values,
    isExternal: false,
  };
};

const findRecordByDate = (
  weekDay: WeekDate,
  records: Array<TimeRecord | TravelRecord>
) => {
  return records.find((record) => {
    const weekDate = new Date(weekDay.date);
    const recordDate = new Date(record.date);

    return isSameDay(weekDate, recordDate);
  });
};

export function floatTo24TimeString(float: number): string {
  const n = new Date(0, 0);
  n.setMinutes(Math.round(float * 60));
  const result = n.toTimeString();

  return result !== "Invalid Date" ? result.slice(0, 5) : "0";
}

export function floatToTotalTimeString(float: number): string {
  const hoursMinutes = float.toString().split(".");
  const hours = +hoursMinutes[0] ? hoursMinutes[0].padStart(2, "0") : "00";

  const formattedMinutes = Math.round(parseFloat(`0.${hoursMinutes[1]}`) * 60);
  const minutes = formattedMinutes.toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function timeStringToFloat(timeString: string): number {
  const hoursMinutes = timeString.split(":");
  const hours = parseInt(hoursMinutes[0], 10);
  const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;

  return +(hours + minutes / 60).toFixed(2);
}

function validateTimeString(timeString: string, maxHours: number): string {
  const float = timeStringToFloat(timeString);

  if (float >= maxHours) {
    return `${maxHours}:00`;
  }

  return floatTo24TimeString(float);
}

export function timesheetFormatter(maxHours: number) {
  return {
    formatter: (value: string, e: InputEvent): string => {
      const formatted = value.replace(/[^0-9.,:]+|\.(?=.*\.)/g, "");

      if (e.type === "blur") {
        const numString = formatted.replace(",", ".");
        const num = +numString;

        if (num <= 0 || numString === ".") return `0`;
        if (num >= maxHours) return `${maxHours}:00`;

        if (!numString.includes(":")) {
          return floatTo24TimeString(num);
        }

        return validateTimeString(numString, maxHours);
      }

      return formatted.slice(0, 5);
    },
  };
}

export function kilometerFormatter(min: number, max: number) {
  return {
    formatter: (value: string, e: InputEvent): string | number => {
      const formatted = value.replace(/[^0-9.,]+|\.(?=.*\.)/g, "");

      if (formatted) {
        const num = +value;
        if (num < min) return min;
        if (num > max) return max;
      }

      const numString = formatted.replace(",", ".");

      if (e.type === "blur") {
        if (numString === "") return "0";
        if (numString.match(/[.]$/)) {
          return numString.slice(0, -1);
        }

        return numString;
      }
      return formatted.slice(0, 4);
    },
  };
}

export const getTimeRecordsToSave = (
  timesheet: WeeklyTimesheet,
  week: WeekDate[]
): TimeRecord[] => {
  const timeRecordsToSave: TimeRecord[] = [];

  timesheet.projects.forEach((project) => {
    if (project.isExternal) return;

    project.values.forEach((value, index) => {
      timeRecordsToSave.push({
        id: project.ids ? project.ids[index] : null,
        date: new Date(week[index].date).getTime(),
        customer: project.customer,
        hours: value,
      });
    });
  });

  return timeRecordsToSave;
};

export const getTravelRecordsToSave = (
  timesheet: WeeklyTimesheet,
  week: WeekDate[]
): TravelRecord[] => {
  const travelRecordsToSave: TravelRecord[] = [];

  timesheet.travelProject?.values.forEach((value, index) => {
    travelRecordsToSave.push({
      id: timesheet.travelProject?.ids[index] || null,
      date: new Date(week[index].date).getTime(),
      kilometers: value,
    });
  });

  return travelRecordsToSave;
};

export const createTimesheetTableData = (params: {
  employees: Employee[];
  timesheets: Timesheet[];
  weeksSpan: WeekSpan[];
}) => {
  const { employees, timesheets, weeksSpan } = params;

  const weekItemsMap = weeksSpan.reduce((acc, week) => {
    acc[week.start.ISO] = recordStatus.EMPTY as TimesheetStatus;
    return acc;
  }, {} as { [isoDate: string]: TimesheetStatus });

  const items = employees.map(
    (employee) =>
      ({
        ...employee,
        ...weekItemsMap,
      } as TimesheetTableItem)
  );

  items.forEach((item) => {
    timesheets.forEach((timesheet) => {
      if (item.id === timesheet.employeeId) {
        item[formatDate(getDayOnGMT(timesheet.date))] = timesheet.status;
      }
    });
  });

  const weekFields: TimesheetTableField[] = weeksSpan.map((week) => ({
    key: week.start.ISO,
    timestamp: week.start.date,
    formatedStartDate: week.start.formatedDate,
    formatedEndDate: week.end.formatedDate,
    weekNumber: getISOWeek(week.start.date),
  }));

  const fields = [
    {
      key: "id",
      label: "Employee",
      stickyColumn: true,
      isRowHeader: true,
      sortable: true,
    },
    ...weekFields,
  ];

  return { items, fields };
};
