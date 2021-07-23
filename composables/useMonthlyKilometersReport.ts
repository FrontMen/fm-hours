export default () => {
  const createKilometersFields = () => {
    return [
      {key: 'name', sortable: true},
      {key: 'kilometers', sortable: true},
    ];
  };

  const getTotalKilometers = (records: TravelRecord[]): number =>
    records.reduce(
      (total, currentRecord) => (total += currentRecord.kilometers),
      0
    );

  const createKilometersItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.employees.forEach((employee) => {
      const kilometers = getTotalKilometers(employee.travelRecords);

      if (kilometers > 0) {
        items.push({
          name: employee.name,
          kilometers,
        });
      }
    });

    return items;
  };

  return {createKilometersFields, createKilometersItems};
};
