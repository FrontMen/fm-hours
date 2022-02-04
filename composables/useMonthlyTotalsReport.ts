import {getTotalsByProp} from '~/helpers/helpers';

export default () => {
  const createTotalsFields = (reportData: MonthlyReportData | null) => {
    const leftFields = [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
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

  const getNonBillableColumns = (
    employee: ReportEmployee,
    nonBillableProjects: Customer[]
  ) => {
    const {nonBillableRecords} = employee;

    return nonBillableProjects.reduce((total: any, currentProject) => {
      const records = nonBillableRecords.filter(
        (record) => record.customer.id === currentProject.id
      );

      total[currentProject.name] = getTotalsByProp<TimeRecord>(
        records,
        'hours'
      );

      return total;
    }, {});
  };

  const createTotalsProject = (
    employee: ReportEmployee,
    report: MonthlyReportData
  ) => {
    const billableHours = getTotalsByProp<TimeRecord>(
      employee.billableRecords,
      'hours'
    );

    const nonBillableHours = getTotalsByProp<TimeRecord>(
      employee.nonBillableRecords,
      'hours'
    );
    const nonBillableColumns = getNonBillableColumns(
      employee,
      report.nonBillableProjects
    );

    const productivity =
      (billableHours / (billableHours + nonBillableHours)) * 100;

    return {
      name: employee.name,
      team: employee.team,
      billable: billableHours,
      nonBillable: nonBillableHours,
      totalHours: +(billableHours + nonBillableHours).toFixed(2),
      productivity: Math.round(productivity || 0) + '%',
      ...nonBillableColumns,
    };
  };

  const createTotalsItems = (
    report: MonthlyReportData | null
  ): ReportEmployee[] | undefined => {
    return report?.employees
      .filter((employee) => employee.billable)
      .map((employee) => createTotalsProject(employee, report));
  };

  return {createTotalsFields, createTotalsItems};
};
