import { isWithinInterval } from "date-fns";
import { recordStatus } from "./record-status";

export const createWeeklyTimesheet = (params: {
  week: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
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
      weeklyTimeRecords
    ),
    travelProject: createTravelProject(params.week, weeklyTravelRecords),
    isReadonly:
      weeklyTimeRecords.some(isPending) || weeklyTravelRecords.some(isPending),
  };
};

const createTimesheetProjects = (
  week: WeekDate[],
  customers: Customer[],
  timeRecords: TimeRecord[]
): TimesheetProject[] => {
  return customers.map((customer) => {
    const projectRecords = timeRecords.filter(
      (x) => x.customer.id === customer.id
    );

    return {
      customer,
      values: week.map(
        (weekDate) =>
          projectRecords.find((x) => x.date === weekDate.date)?.hours || 0
      ),
    };
  });
};

const createTravelProject = (
  week: WeekDate[],
  travelRecords: TravelRecord[]
): TimesheetProject => {
  return {
    customer: {
      id: "travelProjectId",
      name: "Kilometers",
      debtor: "Frontmen",
    },
    values: week.map(
      (weekDate) =>
        travelRecords.find((x) => x.date === weekDate.date)?.kilometers || 0
    ),
  };
};

const isPending = (record: TimeRecord | TravelRecord) =>
  record.status === recordStatus.PENDING ||
  record.status === recordStatus.APPROVED;
