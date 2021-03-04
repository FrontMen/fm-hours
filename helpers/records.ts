import { isWithinInterval } from "date-fns";

// check if two records are the same based on customer and date
export function isSameRecord(record: TimeRecord, recordToCompare: TimeRecord) {
  return (
    record.customer === recordToCompare.customer &&
    record.date === recordToCompare.date
  );
}

// return records with a date between the start and enddate
export function getRecordsForWeekRange(
  records: TimeRecord[],
  startDate: string,
  endDate: string
) {
  return records.filter((entry) =>
    isWithinInterval(new Date(entry.date), {
      start: new Date(startDate),
      end: new Date(endDate),
    })
  );
}

// generate rows for the weekly-value-table component
export function generateWeeklyValuesForTable(
  records: TimeRecord[],
  week: { date: string }[]
) {
  const projects = records.map((record) => ({
    customer: record.customer,
    debtor: record.debtor,
  }));

  const uniqueProjects = projects.reduce(
    (acc: { customer: string; debtor: string }[], project) => {
      if (acc.some((x) => x.customer === project.customer)) {
        return acc;
      }

      return [...acc, project];
    },
    []
  );

  // Add the weekly hours to each project
  return uniqueProjects.map((project) => ({
    ...project,
    values: week.map((day) => {
      const record = records.find(
        (r) => r.customer === project.customer && r.date === day.date
      );

      return {
        date: day.date,
        value: record?.hours || 0,
      };
    }),
  }));
}

// loop trough all records and return a new record list where the status of declared records are updated
export function changeStatusOfRecords(
  allRecords: TimeRecord[],
  recordsToUpdate: TimeRecord[],
  status: RecordStatus
) {
  const filledRecords = allRecords.filter((r) => r.hours);

  return filledRecords.map((record) => {
    const isRecordToUpdate = recordsToUpdate.some((r) =>
      isSameRecord(record, r)
    );

    return {
      ...record,
      status: isRecordToUpdate ? status : record.status,
    };
  });
}

// formatter for the record registration
export function generateValueFormatter(min: number, max: number) {
  return {
    min,
    max,
    formatter: (value: number) =>
      Math.min(Math.max(Number(value) || 0, min), max),
  };
}
