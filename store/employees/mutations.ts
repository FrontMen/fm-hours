import { MutationTree } from "vuex";

const mutations: MutationTree<EmployeesStoreState> = {
  setEmployees: (state, payload: { employees: Employee[] }) => {
    state.employees = payload.employees;
  },

  addNewEmployeeSuccess(state, payload: { employee: Employee }) {
    state.employees = [...state.employees, payload.employee];
  },

  updateEmployee: (state, payload: { employee: Employee }) => {
    state.employees = state.employees.map((employee) =>
      employee.id === payload.employee.id ? payload.employee : employee
    );
  },
};

export default mutations;
