import { MutationTree } from "vuex";

const mutations: MutationTree<EmployeesStoreState> = {
  setEmployees: (state, payload: { employees: Employee[] }) => {
    state.employees = payload.employees;
  },

  updateEmployee: (state, payload: { employee: Employee }) => {
    state.employees = state.employees.map((employee) =>
      employee.id === payload.employee.id ? payload.employee : employee
    );
  },
};

export default mutations;
