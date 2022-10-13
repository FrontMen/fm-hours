import {getTotalsByProp} from '~/helpers/helpers';

export default () => {
  const createKilometersFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'bridgeUid', sortable: false},
      {key: 'team', sortable: true},
      {key: 'kilometers', sortable: true},
    ];
  };

  const createKilometersItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees.forEach(employee => {
      const kilometers = getTotalsByProp<TravelRecord>(employee.travelRecords, 'kilometers');

      if (kilometers > 0) {
        items.push({
          name: employee.name,
          bridgeUid: employee.bridgeUid,
          team: employee.team,
          kilometers,
        });
      }
    });

    return items;
  };

  return {createKilometersFields, createKilometersItems};
};
