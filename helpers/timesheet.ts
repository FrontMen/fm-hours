import { isSameDay, isWithinInterval } from "date-fns";

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
    projects:
      createCustomerProjects(params.week, weeklyCustomers, weeklyTimeRecords) ||
      [],
    travelProject: createTravelProject(params.week, weeklyTravelRecords),
  };
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

export function generateValueFormatter(min: number, max: number) {
  return {
    formatter: (value: string, event: FocusEvent | InputEvent) => {
      // Allows only numbers and a max of 1 dot
      const formatted = value.replace(/[^0-9.]+|\.(?=.*\.)/g, "");

      // Don’t convert to number when the string ends with a dot, so we can add
      // float numbers. In this case a string will be returned.
      if (formatted.match(/\.$/)) {
        // On blur, return a number
        if (event.type === "blur") return +formatted || 0;
        return formatted;
      }

      // Validates range and returns a number
      return +Math.min(Math.max(Number(formatted), min), max).toFixed(1);
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
