import { isSameDay, isWithinInterval } from "date-fns";
import { recordStatus } from "./record-status";

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
    isReadonly:
      weeklyTimeRecords.some(isPending) || weeklyTravelRecords.some(isPending),
  };
};

const createTimesheetProjects = (
  week: WeekDate[],
  customers: Customer[],
  timeRecords: TimeRecord[],
  workScheme: WorkScheme[]
): TimesheetProject[] => {
  const projects: TimesheetProject[] = [];

  const leaveProject = createLeaveProject(workScheme);
  const absenceProject = createAbsceneProject(workScheme);
  const customerProjects = createCustomerProjects(week, customers, timeRecords);

  if (leaveProject) projects.push(leaveProject);
  if (absenceProject) projects.push(absenceProject);
  if (customerProjects.length > 0) projects.push(...customerProjects);

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
      },
      values: holidayHours,
      isExternal: true,
    };
  }

  return null;
};

const createAbsceneProject = (
  workScheme: WorkScheme[]
): TimesheetProject | null => {
  const absenceHours = workScheme.map((scheme) => scheme.holiday);
  const hasAbsenceHours = absenceHours.some((hours) => hours && hours > 0);

  if (hasAbsenceHours) {
    return {
      customer: {
        id: "absenceProjectId",
        name: "Absence",
        debtor: "Frontmen",
      },
      values: absenceHours,
      isExternal: true,
    };
  }

  return null;
};

const createCustomerProjects = (
  week: WeekDate[],
  customers: Customer[],
  timeRecords: TimeRecord[],
): TimesheetProject[] => {
  return customers.map((customer) => {
    const projectRecords = timeRecords.filter(
      (x) => x.customer.id === customer.id
    );

    const values = week.map((weekDay) => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.hours || 0;
    });

    return {
      customer,
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

  return {
    customer: {
      id: "travelProjectId",
      name: "Kilometers",
      debtor: "Frontmen",
    },
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

const isPending = (record: TimeRecord | TravelRecord) =>
  record.status === recordStatus.PENDING ||
  record.status === recordStatus.APPROVED;
