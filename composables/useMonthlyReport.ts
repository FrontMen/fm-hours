import { uniqueByKey } from "~/helpers/array";

export default () => {
  function createFields(report: MonthlyReport | null) {
    const leftFields = [
      { key: "name", sortable: true },
      { key: "project", sortable: true },
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

  function getNonBillableColumns(
    user: ReportUser,
    nonBillableProjects: Customer[]
  ) {
    return nonBillableProjects.reduce((total: any, currentProject) => {
      const records = user.nonBillableProjects.filter(
        (project) => project.customerId === currentProject.id
      );

      total[currentProject.name] = records.reduce(
        (total, y) => (total += y.hours),
        0
      );

      return total;
    }, {});
  }

  function createTotalsProject(user: ReportUser, report: MonthlyReport) {
    const nonBillableColumns = getNonBillableColumns(
      user,
      report.nonBillableProjects
    );

    const nonBillableHours = user.nonBillableProjects.reduce(
      (total, current) => (total += current.hours),
      0
    );

    const productivity =
      (user.billableHours / (user.billableHours + nonBillableHours)) * 100;

    return {
      name: user.name,
      billable: user.billableHours || 0,
      project: "Totals",
      nonBillable: nonBillableHours,
      totalHours: user.billableHours + nonBillableHours,
      productivity: (productivity || 0) + "%",
      ...nonBillableColumns,
    };
  }

  function createRecordProjects(user: ReportUser) {
    const customers = uniqueByKey(
      user.billableRecords.map((x) => x.customer),
      "id"
    );

    return customers.map((customer) => {
      const records = user.billableRecords.filter(
        (x) => x.customer.id === customer.id
      );

      return {
        name: user.name,
        project: customer.name,
        billable: records.reduce((total, record) => (total += record.hours), 0),
      };
    });
  }

  function createItems(report: MonthlyReport | null) {
    const items: any = [];

    report?.users.forEach((user) => {
      items.push(createTotalsProject(user, report));
      items.push(...createRecordProjects(user));
    });

    return items;
  }

  return { createFields, createItems };
};
