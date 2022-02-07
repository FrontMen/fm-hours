import {getTotalsByProp} from '~/helpers/helpers';

export default () => {
  const createStandByFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'hours', sortable: true},
    ];
  };

  const createItem = (employee: ReportEmployee) => {
    return {
      name: employee.name,
      team: employee.team,
      hours: getTotalsByProp<StandbyRecord>(employee.standByRecords, 'hours') || 0,
    };
  };

  const createStandByItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees
      .filter(employee => employee.billable)
      .forEach(employee => {
        items.push(createItem(employee));
      });

    return items;
  };

  return {createStandByFields, createStandByItems};
};
