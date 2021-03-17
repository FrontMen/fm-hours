import { MutationTree } from "vuex";
import { uniqueByKey } from "~/helpers/array";

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: { isLoading: boolean }) {
    state.isLoading = payload.isLoading;
  },

  createMonthlyReport(
    state,
    payload: { users: User[]; timeRecords: TimeRecord[] }
  ) {
    const uniqueProjects = uniqueByKey(payload.timeRecords, "id");
    const nonBillableProjects: Customer[] = uniqueProjects
      .filter((record) =>
        record.customer.debtor.toUpperCase().includes("FRONTMEN")
      )
      .map((record) => record.customer);

    const users = payload.users.map((user) => {
      const userRecords = payload.timeRecords.filter(
        (x) => x.userId === user.id
      );

      const userNonBillableRecords = userRecords.filter((x) =>
        nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      const userBillableRecords = userRecords.filter(
        (x) => !nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      return {
        name: user.name,
        nonBillableProjects: userNonBillableRecords.map((record) => ({
          customerId: record.customer.id,
          hours: record.hours,
        })),
        billableHours: userBillableRecords.reduce(
          (total, record) => (total += record.hours),
          0
        ),
      };
    });

    state.report = {
      nonBillableProjects,
      users,
    };
  },
};

export default mutations;
