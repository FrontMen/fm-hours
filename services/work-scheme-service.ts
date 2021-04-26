export default class WorkSchemeService {
  getWorkScheme(params: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
  }) {
    console.log("retrieve real data from Intracto API with params", params);

    return [
      {
        date: "2020-03-08",
        theoreticalHours: 8,
        absenceHours: 0,
        workHours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-09",
        theoreticalHours: 8,
        absenceHours: 4,
        workHours: 4,
        holiday: 0,
      },
      {
        date: "2020-03-10",
        theoreticalHours: 8,
        absenceHours: 0,
        workHours: 0,
        holiday: 8,
      },
      {
        date: "2020-03-11",
        theoreticalHours: 8,
        absenceHours: 0,
        workHours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-12",
        theoreticalHours: 8,
        absenceHours: 0,
        workHours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-13",
        theoreticalHours: 0,
        absenceHours: 0,
        workHours: 0,
        holiday: 0,
      },
      {
        date: "2020-03-14",
        theoreticalHours: 0,
        absenceHours: 0,
        workHours: 0,
        holiday: 0,
      },
    ];
  }
}
