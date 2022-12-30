import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeeStoreState, RootStoreState> = {
  projects(state, _getters, rootState, rootGetters): Project[] {
    const {employee} = state;

    if (!employee) return [];

    const employeeCustomers: Project[] = employee.projects.reduce(
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
