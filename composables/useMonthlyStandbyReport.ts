export default () => {
  const createStandByFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'hours', sortable: true},
    ];
  };

  // TODO Vlad generic in helpers ?
  const getTotalHours = (records: StandbyRecord[]): number =>
    records.reduce(
      (total, currentRecord) => (total += +currentRecord.hours),
      0
    );

  const createItem = (employee: ReportEmployee) => {
    return {
      name: employee.name,
      hours: getTotalHours(employee.standByRecords) || 0,
    };
  };

  const createStandByItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees.forEach((employee) => {
      items.push(createItem(employee));
    });

    return items;
  };

  return {createStandByFields, createStandByItems};
};
