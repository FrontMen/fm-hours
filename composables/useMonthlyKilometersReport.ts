export default () => {
  const createKilometersFields = () => {
    return [
      { key: "name", sortable: true },
      { key: "kilometers", sortable: true },
    ];
  };

  const getTotalKilometers = (records: TravelRecord[]): number =>
    records.reduce(
      (total, currentRecord) => (total += currentRecord.kilometers),
      0
    );

  const createKilomtersItems = (report: MonthlyReportData | null) => {
    const items: any = [];

    report?.users.forEach((user) => {
      const kilometers = getTotalKilometers(user.travelRecords);

      if (kilometers > 0) {
        items.push({
          name: user.name,
          kilometers,
        });
      }
    });

    return items;
  };

  return { createKilometersFields, createKilomtersItems };
};
