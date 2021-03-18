import { MutationTree } from "vuex";
import { uniqueByKey } from "~/helpers/array";

// MARK: helpers

const getNonBillableProjects = (records: TimeRecord[]): Customer[] => {
  const uniqueProjects = uniqueByKey(records, "id");
  const projects = uniqueProjects.filter((record) =>
    record.customer.debtor.toUpperCase().includes("FRONTMEN")
  );

  return projects.map((record) => record.customer);
};

// MARK: mutations

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: { isLoading: boolean }) {
    state.isLoading = payload.isLoading;
  },

  createMonthlyReportData(
    state,
    payload: {
      users: User[];
      timeRecords: TimeRecord[];
      travelRecords: TravelRecord[];
    }
  ) {
    const { users, timeRecords, travelRecords } = payload;
    const nonBillableProjects = getNonBillableProjects(timeRecords);

    const reportUsers = users.map((user) => {
      const userTimeRecords = timeRecords.filter((x) => x.userId === user.id);

      const userTravelRecords = travelRecords.filter(
        (x) => x.userId === user.id
      );

      const userNonBillableRecords = userTimeRecords.filter((x) =>
        nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      const userBillableRecords = userTimeRecords.filter(
        (x) => !nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      return {
        name: user.name,
        travelRecords: userTravelRecords,
        billableRecords: userBillableRecords,
        nonBillableRecords: userNonBillableRecords,
      };
    });

    state.reportData = {
      nonBillableProjects,
      users: reportUsers,
    };
  },
};

export default mutations;
