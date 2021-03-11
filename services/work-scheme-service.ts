export default class WorkSchemeService {
  getWorkScheme(params: { userId: string; startDate: Date; endDate: Date }) {
    console.log("retrieve real data from Intracto API with params", params);

    return [
      {
        date: "2020-03-08",
        theoretical_hours: 8,
        absence_hours: 0,
        work_hours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-09",
        theoretical_hours: 8,
        absence_hours: 4,
        work_hours: 4,
        holiday: 0,
      },
      {
        date: "2020-03-10",
        theoretical_hours: 8,
        absence_hours: 0,
        work_hours: 0,
        holiday: 8,
      },
      {
        date: "2020-03-11",
        theoretical_hours: 8,
        absence_hours: 0,
        work_hours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-12",
        theoretical_hours: 8,
        absence_hours: 0,
        work_hours: 8,
        holiday: 0,
      },
      {
        date: "2020-03-13",
        theoretical_hours: 0,
        absence_hours: 0,
        work_hours: 0,
        holiday: 0,
      },
      {
        date: "2020-03-14",
        theoretical_hours: 0,
        absence_hours: 0,
        work_hours: 0,
        holiday: 0,
      },
    ];
  }
}
