import {GetterTree} from 'vuex';
import {getTotalsByProp, uniqueByKey} from '~/helpers/helpers';

const getters: GetterTree<ReportsStoreState, RootStoreState> = {
  totalsItems(state) {
    const getNonBillableColumns = (employee: ReportEmployee, nonBillableProjects: Customer[]) => {
      const {nonBillableRecords} = employee;

      return nonBillableProjects.reduce((total: any, currentProject) => {
        const records = nonBillableRecords.filter(
          record => record.customer.id === currentProject.id
        );

        total[currentProject.name] = getTotalsByProp<TimeRecord>(records, 'hours');

        return total;
      }, {});
    };

    return state.reportData.employees
      .filter(employee => employee.billable)
      .map(employee => {
        const billableHours = getTotalsByProp<TimeRecord>(employee.billableRecords, 'hours');

        const nonBillableHours = getTotalsByProp<TimeRecord>(employee.nonBillableRecords, 'hours');
        const nonBillableColumns = getNonBillableColumns(
          employee,
          state.reportData.nonBillableProjects
        );

        const productivity = (billableHours / (billableHours + nonBillableHours)) * 100;

        return {
          name: employee.name,
          team: employee.team,
          billable: billableHours,
          nonBillable: nonBillableHours,
          totalHours: +(billableHours + nonBillableHours).toFixed(2),
          productivity: Math.round(productivity || 0) + '%',
          ...nonBillableColumns,
        };
      });
  },
  projectItems(state) {
    const items: any = [];

    state.reportData.employees
      .filter(employee => employee.billable)
      .forEach(employee => {
        const customers = employee.billableRecords.map(x => x.customer);
        const uniqueCustomers = uniqueByKey(customers, 'id');

        uniqueCustomers.forEach(customer => {
          const records = employee.billableRecords.filter(
            record => record.customer.id === customer.id
          );

          items.push({
            name: employee.name,
            team: employee.team,
            billable: getTotalsByProp<TimeRecord>(records, 'hours') || 0,
            project: customer.name,
          });
        });
      });

    return items;
  },
  kilometerItems(state) {
    const items: any = [];

    state.reportData.employees.forEach(employee => {
      const kilometers = getTotalsByProp<TravelRecord>(employee.travelRecords, 'kilometers');

      if (kilometers > 0) {
        items.push({
          name: employee.name,
          bridgeUid: employee.bridgeUid,
          team: employee.team,
          kilometers: +kilometers.toFixed(2),
        });
      }
    });

    return items;
  },
  standByItems(state) {
    return state.reportData.employees
      .filter(
        employee =>
          employee.billable && getTotalsByProp<StandbyRecord>(employee.standByRecords, 'hours') > 0
      )
      .map(employee => ({
        name: employee.name,
        bridgeUid: employee.bridgeUid,
        team: employee.team,
        hours: getTotalsByProp<StandbyRecord>(employee.standByRecords, 'hours'),
      }));
  },
  nonBillableItems(state) {
    return state.reportData.employees
      .filter(employee => !employee.billable)
      .map(employee => ({
        name: employee.name,
        team: employee.team,
      }));
  },
};

export default getters;
