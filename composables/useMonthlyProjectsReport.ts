import {getTotalsByProp, uniqueByKey} from '~/helpers/helpers';

export default () => {
  const createProjectsFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'project', sortable: true},
      {key: 'debtor', sortable: true},
      {key: 'billable', sortable: true, variant: 'success'},
    ];
  };

  const createItem = (employee: ReportEmployee, customer: Customer) => {
    const records = employee.billableRecords.filter(
      (record) => record.customer.id === customer.id
    );

    return {
      name: employee.name,
      team: employee.team,
      billable: getTotalsByProp<TimeRecord>(records, 'hours') || 0,
      project: customer.name,
      debtor: customer.debtor,
    };
  };

  const createProjectsItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees
      .filter(
        (employee) => employee.billable || employee.billable === undefined
      )
      .forEach((employee) => {
        const customers = employee.billableRecords.map((x) => x.customer);
        const uniqueCustomers = uniqueByKey(customers, 'id');

        uniqueCustomers.forEach((customer) => {
          items.push(createItem(employee, customer));
        });
      });

    return items;
  };

  return {createProjectsFields, createProjectsItems};
};
