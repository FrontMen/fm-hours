import {MutationTree} from 'vuex';

const mutations: MutationTree<EmployeesStoreState> = {
  setAdminList: (state, payload: string[]) => {
    state.adminList = payload;
  },

  set: (state, payload: {employees: Employee[]}) => {
    state.employees = payload.employees;
  },

  add(state, payload: {employee: Employee}) {
    state.employees = [...state.employees, payload.employee];
  },

  update: (state, payload: {employee: Employee}) => {
    state.employees = state.employees.map(employee =>
      employee.id === payload.employee.id ? payload.employee : employee
    );
  },
};

export default mutations;
