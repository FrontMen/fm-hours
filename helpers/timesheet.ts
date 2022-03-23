import {isSameDay, getISOWeek, getYear, isThisWeek} from 'date-fns';

import {recordStatus} from './record-status';
import {getDayOnGMT, formatDate} from './dates';

export const createWeeklyTimesheet = (params: {
  sheet: Optional<Timesheet, 'id'>;
  week: WeekDate[];
  projects: Project[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  standByRecords: StandbyRecord[];
  workScheme: WorkScheme[];
}): WeeklyTimesheet => {
  return {
    info: params.sheet,
    week: params.week,
    projects: createCustomerProjects(params.week, params.timeRecords, params.projects) || [],
    leaveDays: createLeaveProject(params.week, params.workScheme),
    travelProject: createTravelProject(params.week, params.travelRecords),
    standByProject: createStandByProject(params.week, params.standByRecords),
    workScheme: params.workScheme,
  };
};

const createCustomerProjects = (
  week: WeekDate[],
  timeRecords: TimeRecord[],
  employeeProjects: Project[]
): TimesheetProject[] => {
  const projects: Project[] = [];

  // Get customers from timeRecords
  timeRecords.forEach(timeRecord => {
    if (!projects.some(x => x.customer.id === timeRecord.customer.id)) {
      projects.push({
        customer: timeRecord.customer,
        contract:
          employeeProjects.find(p => p.customer.id === timeRecord.customer.id)?.contract || null,
      });
    }
  });

  // Add all availableCustomers as well
  employeeProjects.forEach(project => {
    if (!projects.some(x => x.customer.id === project.customer.id)) {
      projects.push(project);
    }
  });

  // Add records to the right customers
  return projects.map(project => {
    const projectRecords = timeRecords.filter(x => x.customer.id === project.customer.id);

    const hours = week.map(weekDay => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.hours || 0;
    });

    const ids = week.map(weekDay => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.id || null;
    });

    const worklogs = week.map(weekDay => {
      const record = findRecordByDate(weekDay, projectRecords) as TimeRecord;
      return record?.worklogId || null;
    });

    return {
      project,
      ids,
      values: hours,
      worklogs,
    };
  });
};

const createStandByProject = (
  week: WeekDate[],
  standByRecords: StandbyRecord[] | null
): TimesheetProject | null => {
  if (!standByRecords) return null;

  const values = week.map(weekDay => {
    const record = findRecordByDate(weekDay, standByRecords) as StandbyRecord;
    return record?.hours || 0;
  });

  const ids = week.map(weekDay => {
    const record = findRecordByDate(weekDay, standByRecords) as StandbyRecord;
    return record?.id || null;
  });

  return {
    project: {
      contract: null,
      customer: {
        id: 'standByRecordId',
        name: 'Stand-by Hours',
        debtor: 'Frontmen',
        isBillable: false,
        isDefault: false,
      },
    },
    ids,
    values,
  };
};

const createTravelProject = (week: WeekDate[], travelRecords: TravelRecord[]): TimesheetProject => {
  const hours = week.map(weekDay => {
    const record = findRecordByDate(weekDay, travelRecords) as TravelRecord;
    return record?.kilometers || 0;
  });

  const ids = week.map(weekDay => {
    const record = findRecordByDate(weekDay, travelRecords) as TravelRecord;
    return record?.id || null;
  });

  return {
    project: {
      contract: null,
      customer: {
        id: 'travelProjectId',
        name: 'Kilometers',
        debtor: 'Frontmen',
        isBillable: false,
        isDefault: false,
      },
    },
    ids,
    values: hours,
  };
};

export const createLeaveProject = (
  week: WeekDate[],
  workScheme: WorkScheme[]
): TimesheetProject | null => {
  const hours = week.map(leaveDay => findLeaveHoursByDate(leaveDay, workScheme));
  const noHolidays: boolean = hours.every(value => value === 0);
  return !noHolidays
    ? {
        project: {
          contract: null,
          customer: {
            id: 'leaveProjectId',
            name: 'Days',
            debtor: 'Frontmen',
            isBillable: false,
            isDefault: false,
          },
        },
        ids: new Array(hours.length).fill(null),
        values: hours,
      }
    : null;
};

const findLeaveHoursByDate = (leaveDay: WeekDate, workScheme: WorkScheme[]): number =>
  workScheme.find((workSchemeDate: WorkScheme) => workSchemeDate.date === leaveDay.date)
    ?.absenceHours ?? 0;

const findRecordByDate = (
  weekDay: WeekDate,
  records: Array<TimeRecord | TravelRecord | StandbyRecord>
) => {
  return records.find(record => {
    const weekDate = new Date(weekDay.date);
    const recordDate = new Date(record.date);

    return isSameDay(weekDate, recordDate);
  });
};

export function floatTo24TimeString(float: number): string {
  const n = new Date(0, 0);
  n.setMinutes(Math.round(float * 60));
  const result = n.toTimeString();

  return result !== 'Invalid Date' ? result.slice(0, 5) : '0';
}

export function floatToTotalTimeString(float: number): string {
  const hoursMinutes = float.toString().split('.');
  const hours = +hoursMinutes[0] ? hoursMinutes[0].padStart(2, '0') : '00';

  const formattedMinutes = Math.round(parseFloat(`0.${hoursMinutes[1]}`) * 60);
  const minutes = formattedMinutes.toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function timeStringToFloat(timeString: string): number {
  const hoursMinutes = timeString.split(':');
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
      const formatted = value.replace(/[^0-9.,:]+|\.(?=.*\.)/g, '');

      if (e.type === 'blur') {
        const numString = formatted.replace(',', '.');
        const num = +numString;

        if (num <= 0 || numString === '.') return `0`;
        if (num >= maxHours) return `${maxHours}:00`;

        if (!numString.includes(':')) {
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
      const formatted = value.replace(/[^0-9.,]+|\.(?=.*\.)/g, '');

      if (formatted) {
        const num = +value;
        if (num < min) return min;
        if (num > max) return max;
      }

      const numString = formatted.replace(',', '.');

      if (e.type === 'blur') {
        if (numString === '') return '0';
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
  timesheet: WeeklyTimesheet
): {records: TimeRecord[]; contracts: number[]} => {
  const timeRecordsToSave: TimeRecord[] = [];
  const timeRecordsContracts: number[] = [];

  timesheet.projects.forEach(project => {
    project.values.forEach((value, index) => {
      timeRecordsToSave.push({
        id: project.ids ? project.ids[index] : null,
        date: new Date(timesheet.week[index].date).getTime(),
        customer: project.project.customer,
        hours: value,
        worklogId: project.worklogs?.[index],
      });
      timeRecordsContracts.push(project.project.contract?.id || -1);
    });
  });

  return {records: timeRecordsToSave, contracts: timeRecordsContracts};
};

export const getStandByRecordsToSave = (timesheet: WeeklyTimesheet): StandbyRecord[] => {
  const standByRecordsToSave: StandbyRecord[] = [];

  timesheet.standByProject?.values.forEach((value, index) => {
    standByRecordsToSave.push({
      id: timesheet.standByProject?.ids[index] || null,
      date: new Date(timesheet.week[index].date).getTime(),
      hours: value,
    });
  });

  return standByRecordsToSave;
};

export const getTravelRecordsToSave = (timesheet: WeeklyTimesheet): TravelRecord[] => {
  const travelRecordsToSave: TravelRecord[] = [];

  timesheet.travelProject?.values.forEach((value, index) => {
    travelRecordsToSave.push({
      id: timesheet.travelProject?.ids[index] || null,
      date: new Date(timesheet.week[index].date).getTime(),
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
  const {employees, timesheets, weeksSpan} = params;

  const weekItemsMap = weeksSpan.reduce((acc, week) => {
    acc[week.start.ISO] = recordStatus.EMPTY as TimesheetStatus;
    return acc;
  }, {} as {[isoDate: string]: TimesheetStatus});

  const items = employees.map(
    employee =>
      ({
        ...employee,
        ...weekItemsMap,
      } as TimesheetTableItem)
  );

  items.forEach(item => {
    timesheets.forEach(timesheet => {
      if (item.id === timesheet.employeeId) {
        item[formatDate(getDayOnGMT(timesheet.date))] = timesheet.status;
      }
    });
  });

  const weekFields: TimesheetTableField[] = weeksSpan.map(week => ({
    key: week.start.ISO,
    timestamp: week.start.date,
    timestampEnd: week.end.date,
    formatedStartDate: week.start.formatedDate,
    formatedEndDate: week.end.formatedDate,
    weekNumber: getISOWeek(week.start.date),
    isThisWeek: isThisWeek(week.start.date),
    year: getYear(week.start.date),
  }));

  const fields = [
    {
      key: 'id',
      label: 'Employee',
      stickyColumn: true,
      isRowHeader: true,
    },
    ...weekFields,
  ];

  return {items, fields};
};
