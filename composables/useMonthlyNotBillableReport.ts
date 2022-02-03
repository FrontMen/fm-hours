export default () => {
  const createNotBillableFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
    ];
  };

  const createItem = (employee: ReportEmployee) => {
    return {
      name: employee.name,
      team: employee.team,
    };
  };

  const createNotBillableItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees
      .filter(
        (employee) => !employee.billable && employee.billable !== undefined
      )
      .forEach((employee) => {
        items.push(createItem(employee));
      });

    return items;
  };

  return {createNotBillableFields, createNotBillableItems};
};
