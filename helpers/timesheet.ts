import { isSameDay, isWithinInterval } from "date-fns";
import { recordStatus } from "./record-status";

export const createWeeklyTimesheet = (params: {
  week: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  workScheme: WorkScheme[];
  status?: RecordStatus;
}): WeeklyTimesheet => {
  const start = new Date(params.week[0].date);
  const end = new Date(params.week[6].date);

  const isWithinCurrentWeek = (record: TimeRecord | TravelRecord) =>
    isWithinInterval(new Date(record.date), { start, end });

  const weeklyCustomers: Customer[] = [];
  const weeklyTimeRecords = params.timeRecords.filter(isWithinCurrentWeek);
  const weeklyTravelRecords = params.travelRecords.filter(isWithinCurrentWeek);
  const weeklyStatus = params.status || getWeeklyStatus(weeklyTimeRecords);

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
    status: weeklyStatus as RecordStatus,
    isReadonly:
      weeklyStatus === recordStatus.APPROVED ||
      weeklyStatus === recordStatus.PENDING,
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

const getWeeklyStatus = (weeklyTimeRecords: TimeRecord[]) => {
  if (weeklyTimeRecords.some((x) => x.status === recordStatus.APPROVED))
    return recordStatus.APPROVED;

  if (weeklyTimeRecords.some((x) => x.status === recordStatus.DENIED))
    return recordStatus.DENIED;

  if (weeklyTimeRecords.some((x) => x.status === recordStatus.PENDING))
    return recordStatus.PENDING;

  return recordStatus.NEW;
};

export function generateValueFormatter(min: number, max: number) {
  return {
    min,
    max,
    formatter: (value: number) =>
      Math.min(Math.max(Number(value) || 0, min), max),
  };
}

export const getTimeRecordsToSave = (
  timesheet: WeeklyTimesheet,
  week: WeekDate[],
  status: RecordStatus
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
        status,
      });
    });
  });

  return timeRecordsToSave;
};

export const getTravelRecordsToSave = (
  timesheet: WeeklyTimesheet,
  week: WeekDate[],
  status: RecordStatus
): TravelRecord[] => {
  const travelRecordsToSave: TravelRecord[] = [];

  timesheet.travelProject?.values.forEach((value, index) => {
    travelRecordsToSave.push({
      id: timesheet.travelProject?.ids[index] || null,
      date: new Date(week[index].date).getTime(),
      kilometers: value,
      status,
    });
  });

  return travelRecordsToSave;
};
