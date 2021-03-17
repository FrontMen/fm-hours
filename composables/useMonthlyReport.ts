export default () => {
  function createFields(report: MonthlyReport | null) {
    const leftFields = [
      { key: "name", sortable: true },
      { key: "billable", sortable: true, variant: "success" },
      { key: "nonBillable", sortable: true, variant: "warning" },
    ];

    const middleFields = report?.nonBillableProjects.map((project) => ({
      key: project.name,
      sortable: true,
    }));

    const rightFields = [
      { key: "totalHours", sortable: true, variant: "info" },
      { key: "productivity", sortable: true, variant: "info" },
    ];

    return [...leftFields, ...(middleFields || []), ...rightFields];
  }

  function createItems(report: MonthlyReport | null) {
    if (!report || !report.users) return [];

    return report.users.map((entry) => {
      const nonBillableColumns = report?.nonBillableProjects.reduce(
        (total: any, current) => {
          total[current.name] = entry.nonBillableProjects
            .filter((x) => x.customerId === current.id)
            .reduce((total, y) => (total += y.hours), 0);

          return total;
        },
        {}
      );

      const nonBillableHours = entry.nonBillableProjects.reduce(
        (total, current) => (total += current.hours),
        0
      );

      return {
        name: entry.name,
        billable: entry.billableHours || 0,
        nonBillable: nonBillableHours,
        totalHours: entry.billableHours + nonBillableHours,
        productivity:
          (entry.billableHours / (entry.billableHours + nonBillableHours)) *
            100 +
          "%",
        ...nonBillableColumns,
      };
    });
  }

  return { createFields, createItems };
};
