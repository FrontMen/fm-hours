export default () => {
  const createTotalsFields = (reportData: MonthlyReportData | null) => {
    const leftFields = [
      {key: 'name', sortable: true},
      {key: 'billable', sortable: true, variant: 'success'},
      {key: 'nonBillable', sortable: true, variant: 'warning'},
    ];

    const middleFields = reportData?.nonBillableProjects.map((project) => ({
      key: project.name,
      sortable: true,
    }));

    const rightFields = [
      {key: 'totalHours', sortable: true, variant: 'info'},
      {key: 'productivity', sortable: true, variant: 'info'},
    ];

    return [...leftFields, ...(middleFields || []), ...rightFields];
  };

  const getTotalHours = (records: TimeRecord[]): number =>
    records.reduce(
      (total, currentRecord) => (total += +currentRecord.hours),
      0
    );

  const getNonBillableColumns = (
    employee: ReportEmployee,
    nonBillableProjects: Customer[]
  ) => {
    const {nonBillableRecords} = employee;

    return nonBillableProjects.reduce((total: any, currentProject) => {
      const records = nonBillableRecords.filter(
        (record) => record.customer.id === currentProject.id
      );

      total[currentProject.name] = getTotalHours(records);
      return total;
    }, {});
  };

  const createTotalsProject = (
    employee: ReportEmployee,
    report: MonthlyReportData
  ) => {
    const billableHours = getTotalHours(employee.billableRecords);

    const nonBillableHours = getTotalHours(employee.nonBillableRecords);
    const nonBillableColumns = getNonBillableColumns(
      employee,
      report.nonBillableProjects
    );

    const productivity =
      (billableHours / (billableHours + nonBillableHours)) * 100;

    return {
      name: employee.name,
      billable: billableHours,
      nonBillable: nonBillableHours,
      totalHours: +(billableHours + nonBillableHours).toFixed(2),
      productivity: Math.round(productivity || 0) + '%',
      ...nonBillableColumns,
    };
  };

  const createTotalsItems = (report: MonthlyReportData | null) => {
    return report?.employees.map((employee) =>
      createTotalsProject(employee, report)
    );
  };

  return {createTotalsFields, createTotalsItems};
};
