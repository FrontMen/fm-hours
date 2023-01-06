import {GetterTree} from 'vuex';

const getters: GetterTree<CustomersStoreState, RootStoreState> = {
  defaultCustomers(state): Customer[] {
    return state.customers.filter(customer => customer.isDefault);
  },
  customersList(state): Customer[] {
    return state.customers;
  },
  projects:
    (state, getters): Function =>
    (employee: Employee) => {
      const employeeCustomers: Project[] = employee.projects.reduce(
        (list: Project[], project: EmployeeProject) => {
          const foundCustomer = state.customers.find(
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

      const availableToAll: Project[] = getters.defaultCustomers.map((customer: Customer) => {
        const {contract, ...cleanCustomer} = customer;
        return {
          customer: cleanCustomer,
          contract: contract || null,
        };
      });

      return [...employeeCustomers, ...availableToAll];
    },
};

export default getters;
