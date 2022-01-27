import {getTotalsByProp} from '~/helpers/helpers';

export default () => {
  const createNotBillableFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'nonBillable', sortable: true},
    ];
  };

  const createItem = (employee: ReportEmployee) => {
    return {
      name: employee.name,
      team: employee.team,
      nonBillable:
        getTotalsByProp<TimeRecord>(employee.nonBillableRecords, 'hours') || 0,
    };
  };

  const createNotBillableItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees.forEach((employee) => {
      items.push(createItem(employee));
    });

    return items;
  };

  return {createNotBillableFields, createNotBillableItems};
};
