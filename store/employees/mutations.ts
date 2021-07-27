import {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeesStoreState> = {
  setAdminList: (state, payload: string[]) => {
    state.adminList = payload;
  },

  setTeamList: (state, payload: string[]) => {
    state.teamList = payload;
  },

  setEmployees: (state, payload: {employees: Employee[]}) => {
    state.employees = payload.employees;
  },

  addNewEmployeeSuccess(state, payload: {employee: Employee}) {
    state.employees = [...state.employees, payload.employee];
  },

  updateEmployee: (state, payload: {employee: Employee}) => {
    state.employees = state.employees.map((employee) =>
      employee.id === payload.employee.id ? payload.employee : employee
    );
  },

  deleteEmployeeSuccess: (state, deletedId: string) => {
    state.employees = state.employees.filter((i) => i.id !== deletedId);
  },
};

export default mutations;
