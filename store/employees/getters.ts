import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  projects:
    (state, _getters, rootState, rootGetters): Function =>
    (employeeId: string) => {
      const foundEmployee = state.employees.find(employee => employee.id === employeeId);
      if (!foundEmployee) return [];

      const employeeCustomers: Project[] = foundEmployee.projects.reduce(
        (list: Project[], project: EmployeeProject) => {
          const foundCustomer = rootState.customers.customers.find(
            customer => customer.id === project.customerId
          );
          if (!foundCustomer) return list;

          const {contract: customerContract, ...customer} = foundCustomer;
          const contract = project.contract || customerContract || null;

          const newProject = {
            customer,
            contract,
          } as Project;

          list.push(newProject);
          return list;
        },
        []
      );

      const availableToAll: Project[] = rootGetters['customers/defaultCustomers'].map(
        (customer: Customer) => {
          const {contract, ...cleanCustomer} = customer;
          return {
            customer: cleanCustomer,
            contract: contract || null,
          };
        }
      );

      return [...employeeCustomers, ...availableToAll];
    },
};

export default getters;
