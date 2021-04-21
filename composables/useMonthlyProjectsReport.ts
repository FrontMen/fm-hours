import { uniqueByKey } from "~/helpers/array";

export default () => {
  const createProjectsFields = () => {
    return [
      { key: "name", sortable: true },
      { key: "project", sortable: true },
      { key: "debtor", sortable: true },
      { key: "billable", sortable: true, variant: "success" },
    ];
  };

  const getTotalHours = (records: TimeRecord[]): number =>
    records.reduce((total, currentRecord) => (total += currentRecord.hours), 0);

  const createItem = (user: ReportUser, customer: Customer) => {
    const records = user.billableRecords.filter(
      (record) => record.customer.id === customer.id
    );

    return {
      name: user.name,
      billable: getTotalHours(records) || 0,
      project: customer.name,
      debtor: customer.debtor,
    };
  };

  const createProjectsItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.users.forEach((user) => {
      const customers = user.billableRecords.map((x) => x.customer);
      const uniqueCustomers = uniqueByKey(customers, "id");

      uniqueCustomers.forEach((customer) => {
        items.push(createItem(user, customer));
      });
    });

    return items;
  };

  return { createProjectsFields, createProjectsItems };
};
