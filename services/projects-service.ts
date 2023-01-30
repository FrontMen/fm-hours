import type {NuxtFireInstance} from '@nuxtjs/firebase';
import firebase from 'firebase/compat';
import CustomersService from './customers-service';
import EmployeesService from './employees-service';

export default class ProjectsService {
  employeesService: EmployeesService;
  customersService: CustomersService;

  constructor(fire: NuxtFireInstance, fireModule: typeof firebase) {
    this.employeesService = new EmployeesService(fire, fireModule);
    this.customersService = new CustomersService(fire, fireModule);
  }

  async getProjects(employeeId: string) {
    const employees = await this.employeesService.getAll();
    const foundEmployee = employees.find(employee => employee.id === employeeId);
    if (!foundEmployee) return [];
    const customers = await this.customersService.getCustomers();
    const defaultCustomers = customers.filter(customer => customer.isDefault);

    // Add ID to keep track of it locally. To be generated in BE later on
    let projectId = 0;

    const employeeCustomers: Project[] = foundEmployee.projects.reduce(
      (list: Project[], project: EmployeeProject) => {
        const foundCustomer = customers.find(customer => customer.id === project.customerId);
        if (!foundCustomer) return list;

        const {contract: customerContract, ...customer} = foundCustomer;
        const contract = project.contract || customerContract || null;

        const newProject = {
          id: `${projectId++}`,
          customer,
          contract,
        } as Project;

        list.push(newProject);
        return list;
      },
      []
    );

    let availableToAll: Project[] = [];

    if (!foundEmployee.freelancer) {
      availableToAll = defaultCustomers.map((customer: Customer) => {
        const {contract, ...cleanCustomer} = customer;
        return {
          id: `${projectId++}`,
          customer: cleanCustomer,
          contract: contract || null,
        };
      });
    }

    return [...employeeCustomers, ...availableToAll];
  }
}
