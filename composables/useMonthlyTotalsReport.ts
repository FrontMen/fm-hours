export default () => {
  const createFields = (reportData: MonthlyReportData | null) => {
    const leftFields = [
      { key: "name", sortable: true },
      { key: "billable", sortable: true, variant: "success" },
      { key: "nonBillable", sortable: true, variant: "warning" },
    ];

    const middleFields = reportData?.nonBillableProjects.map((project) => ({
      key: project.name,
      sortable: true,
    }));

    const rightFields = [
      { key: "totalHours", sortable: true, variant: "info" },
      { key: "productivity", sortable: true, variant: "info" },
      { key: "kilometers", sortable: true },
    ];

    return [...leftFields, ...(middleFields || []), ...rightFields];
  };

  const getTotalHours = (records: TimeRecord[]): number =>
    records.reduce((total, currentRecord) => (total += currentRecord.hours), 0);

  const getTotalKilometers = (records: TravelRecord[]): number =>
    records.reduce(
      (total, currentRecord) => (total += currentRecord.kilometers),
      0
    );

  const getNonBillableColumns = (
    user: ReportUser,
    nonBillableProjects: Customer[]
  ) => {
    const { nonBillableRecords } = user;

    return nonBillableProjects.reduce((total: any, currentProject) => {
      const records = nonBillableRecords.filter(
        (record) => record.customer.id === currentProject.id
      );

      total[currentProject.name] = getTotalHours(records);
      return total;
    }, {});
  };

  const createTotalsProject = (user: ReportUser, report: MonthlyReportData) => {
    const billableHours = getTotalHours(user.billableRecords);

    const nonBillableHours = getTotalHours(user.nonBillableRecords);
    const nonBillableColumns = getNonBillableColumns(
      user,
      report.nonBillableProjects
    );

    const productivity =
      (billableHours / (billableHours + nonBillableHours)) * 100;

    return {
      name: user.name,
      billable: billableHours,
      nonBillable: nonBillableHours,
      totalHours: billableHours + nonBillableHours,
      productivity: Math.round(productivity || 0) + "%",
      kilometers: getTotalKilometers(user.travelRecords) || 0,
      ...nonBillableColumns,
    };
  };

  const createItems = (report: MonthlyReportData | null) => {
    return report?.users.map((user) => createTotalsProject(user, report));
  };

  return { createFields, createItems };
};
