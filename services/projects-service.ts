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

    const employeeCustomers: Project[] = foundEmployee.projects.reduce(
      (list: Project[], project: EmployeeProject) => {
        const foundCustomer = customers.find(customer => customer.id === project.customerId);
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

    const availableToAll: Project[] = defaultCustomers.map((customer: Customer) => {
      const {contract, ...cleanCustomer} = customer;
      return {
        customer: cleanCustomer,
        contract: contract || null,
      };
    });

    return [...employeeCustomers, ...availableToAll];
  }
}
